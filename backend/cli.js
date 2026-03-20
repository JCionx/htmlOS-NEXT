const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { db, seedUserData } = require("./db"); // Adjust path if db.js is elsewhere

// Setup interactive terminal prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Helper to gracefully exit
const exitCLI = (code = 0) => {
  db.close();
  rl.close();
  process.exit(code);
};

// --- CLI COMMANDS ---

async function addUser(username, password) {
  if (!username || !password) {
    console.error(
      "❌ Error: Missing username or password.\nUsage: node cli.js user add <username> <password>",
    );
    return exitCLI(1);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hash],
      function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT")
            console.error(`❌ Error: User '${username}' already exists.`);
          else console.error("❌ Database error:", err);
          return exitCLI(1);
        }

        const userId = this.lastID;
        const dataDir = path.join(__dirname, "data");
        const userDir = path.join(dataDir, String(userId));

        // Create user directories
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
        fs.mkdirSync(userDir, { recursive: true });
        fs.mkdirSync(path.join(userDir, "Documents"));
        fs.mkdirSync(path.join(userDir, "Downloads"));
        fs.mkdirSync(path.join(userDir, "Applications"));
        fs.mkdirSync(path.join(userDir, "Pictures"));
        fs.mkdirSync(path.join(userDir, "Music"));
        fs.mkdirSync(path.join(userDir, "Movies"));
        fs.mkdirSync(path.join(userDir, "config"));

        // Seed default OS settings/apps
        seedUserData(userId);

        console.log(
          `✅ Success: User '${username}' created with ID ${userId}.`,
        );
        exitCLI(0);
      },
    );
  } catch (err) {
    console.error("❌ Internal error:", err);
    exitCLI(1);
  }
}

async function removeUser(username) {
  if (!username) {
    console.error(
      "❌ Error: Missing username.\nUsage: node cli.js user remove <username>",
    );
    return exitCLI(1);
  }

  const answer = await askQuestion(
    `⚠️ WARNING: Are you sure you want to permanently delete user '${username}'? (y/N): `,
  );
  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    return exitCLI(0);
  }

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      console.error(`❌ Error: User '${username}' not found.`);
      return exitCLI(1);
    }

    const userId = user.id;

    // Delete from DB (Filetypes, Apps, Settings, Users)
    db.serialize(() => {
      db.run("DELETE FROM filetypes WHERE user_id = ?", [userId]);
      db.run("DELETE FROM apps WHERE user_id = ?", [userId]);
      db.run("DELETE FROM settings WHERE user_id = ?", [userId]);
      db.run("DELETE FROM users WHERE id = ?", [userId], (err) => {
        if (err) {
          console.error("❌ Failed to delete user from database.");
          return exitCLI(1);
        }

        // Delete user directory
        const userDir = path.join(__dirname, "data", String(userId));
        if (fs.existsSync(userDir)) {
          fs.rmSync(userDir, { recursive: true, force: true });
        }

        console.log(
          `✅ Success: User '${username}' and all associated data have been deleted.`,
        );
        exitCLI(0);
      });
    });
  });
}

async function editUser(currentUsername, newUsername, newPassword) {
  if (!currentUsername || (!newUsername && !newPassword)) {
    console.error(
      "❌ Error: Missing arguments.\nUsage: node cli.js user edit <current_username> <new_username> [new_password]",
    );
    return exitCLI(1);
  }

  db.get(
    "SELECT id FROM users WHERE username = ?",
    [currentUsername],
    async (err, user) => {
      if (err || !user) {
        console.error(`❌ Error: User '${currentUsername}' not found.`);
        return exitCLI(1);
      }

      let query = "UPDATE users SET";
      let params = [];

      if (newUsername) {
        query += " username = ?";
        params.push(newUsername);
      }

      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        if (newUsername) query += ",";
        query += " password = ?";
        params.push(hash);
      }

      query += " WHERE id = ?";
      params.push(user.id);

      db.run(query, params, (err) => {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT")
            console.error(
              `❌ Error: Username '${newUsername}' is already taken.`,
            );
          else console.error("❌ Database error:", err);
          return exitCLI(1);
        }
        console.log(`✅ Success: User '${currentUsername}' updated.`);
        exitCLI(0);
      });
    },
  );
}

async function resetUser(username) {
  if (!username) {
    console.error(
      "❌ Error: Missing username.\nUsage: node cli.js user reset <username>",
    );
    return exitCLI(1);
  }

  const answer = await askQuestion(
    `⚠️ WARNING: This will wipe ALL files, apps, and settings for '${username}'. Proceed? (y/N): `,
  );
  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    return exitCLI(0);
  }

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      console.error(`❌ Error: User '${username}' not found.`);
      return exitCLI(1);
    }

    const userId = user.id;

    // Wipe DB tables (keep the user login row)
    db.serialize(() => {
      db.run("DELETE FROM filetypes WHERE user_id = ?", [userId]);
      db.run("DELETE FROM apps WHERE user_id = ?", [userId]);
      db.run("DELETE FROM settings WHERE user_id = ?", [userId], () => {
        // Wipe file system
        const userDir = path.join(__dirname, "data", String(userId));
        if (fs.existsSync(userDir)) {
          fs.rmSync(userDir, { recursive: true, force: true });
        }

        // Recreate blank folders
        fs.mkdirSync(userDir, { recursive: true });
        fs.mkdirSync(path.join(userDir, "Documents"));
        fs.mkdirSync(path.join(userDir, "Downloads"));
        fs.mkdirSync(path.join(userDir, "Applications"));
        fs.mkdirSync(path.join(userDir, "Pictures"));
        fs.mkdirSync(path.join(userDir, "Music"));
        fs.mkdirSync(path.join(userDir, "Movies"));
        fs.mkdirSync(path.join(userDir, "config"));

        // Re-run seeder to restore defaults
        seedUserData(userId);

        console.log(`✅ Success: User '${username}' has been factory reset.`);
        exitCLI(0);
      });
    });
  });
}

// --- COMMAND ROUTER ---

const args = process.argv.slice(2);
const command = args[0];
const action = args[1];

if (command === "user") {
  switch (action) {
    case "add":
      addUser(args[2], args[3]);
      break;
    case "remove":
      removeUser(args[2]);
      break;
    case "edit":
      editUser(args[2], args[3], args[4]);
      break;
    case "reset":
      resetUser(args[2]);
      break;
    default:
      console.error("❌ Unknown action. Available: add, remove, edit, reset");
      exitCLI(1);
  }
} else {
  console.log("Usage:");
  console.log("  node cli.js user add <username> <password>");
  console.log("  node cli.js user remove <username>");
  console.log(
    "  node cli.js user edit <current_username> <new_username> [new_password]",
  );
  console.log("  node cli.js user reset <username>");
  exitCLI(1);
}
