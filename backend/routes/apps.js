const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { db } = require("../db");
const https = require("https");
const http = require("http");
const unzipper = require("unzipper");

const { authenticateToken } = require("../middleware/authenticateToken");

function normalizeLocale(locale) {
  if (!locale || typeof locale !== "object" || Array.isArray(locale)) {
    return null;
  }

  const normalized = {};

  for (const [lang, value] of Object.entries(locale)) {
    if (typeof lang === "string" && typeof value === "string") {
      const trimmedLang = lang.trim();
      const trimmedValue = value.trim();
      if (trimmedLang && trimmedValue) {
        normalized[trimmedLang] = trimmedValue;
      }
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function normalizeFiletypes(filetypes) {
  if (!Array.isArray(filetypes)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const filetype of filetypes) {
    if (typeof filetype !== "string") {
      continue;
    }

    const cleaned = filetype.trim().replace(/^\.+/, "").toLowerCase();
    if (!cleaned) {
      continue;
    }

    if (!/^[a-z0-9]+$/.test(cleaned)) {
      continue;
    }

    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      normalized.push(cleaned);
    }
  }

  return normalized;
}

router.get("/list", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all("SELECT * FROM apps WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    const apps = rows.map((app) => ({
      ...app,
      permissions: app.permissions ? JSON.parse(app.permissions) : [],
      locale: app.name_locale ? JSON.parse(app.name_locale) : {},
    }));

    res.json(apps);
  });
});

router.get("/filetypes", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT app_id, filetype, "default" as is_default FROM filetypes WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      const result = {};
      rows.forEach((row) => {
        if (!result[row.filetype]) {
          result[row.filetype] = [];
        }
        result[row.filetype].push({
          app: row.app_id,
          default: row.is_default === 1,
        });
      });

      res.json(result);
    },
  );
});

router.post("/filetypes/set-default", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { filetype, appId } = req.body;

  if (!filetype || !appId) {
    return res.status(400).json({ error: "Missing filetype or appId" });
  }

  try {
    // First, set all apps for this filetype to not default
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE filetypes SET "default" = 0 WHERE user_id = ? AND filetype = ?',
        [userId, filetype],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });

    // Then, set the specified app as default for this filetype
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE filetypes SET "default" = 1 WHERE user_id = ? AND filetype = ? AND app_id = ?',
        [userId, filetype, appId],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0)
            reject(new Error("Filetype or app not found"));
          else resolve();
        },
      );
    });

    res.json({ success: true, message: "Default app updated successfully" });
  } catch (error) {
    console.error("Failed to set default app:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to set default app" });
  }
});

router.get("/delete/:id", authenticateToken, (req, res) => {
  const appId = req.params.id;
  const userId = req.user.id;

  db.run("DELETE FROM filetypes WHERE app_id = ? AND user_id = ?", [
    appId,
    userId,
  ]);

  db.run(
    "DELETE FROM apps WHERE id = ? AND user_id = ?",
    [appId, userId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (this.changes === 0) {
        return res
          .status(404)
          .json({ error: "App not found or not owned by user" });
      }

      res.json({ message: "App deleted successfully" });
    },
  );

  const appDir = path.join(__dirname, "../data", String(userId), "apps", appId);
  if (fs.existsSync(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true });
  }
});

router.get("/run/:appId/*filePath", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const appId = req.params.appId;
  const requestedPath = req.params.filePath;

  const safePath = Array.isArray(requestedPath)
    ? requestedPath.join("/")
    : requestedPath || "";

  let appFolder;

  if (appId.startsWith("sys.next.")) {
    appFolder = path.join(__dirname, "../apps", appId);
  } else {
    appFolder = path.join(
      __dirname,
      "../data",
      String(userId),
      "Applications",
      appId,
    );
  }

  const filePath = path.resolve(appFolder, safePath);

  if (!filePath.startsWith(appFolder + path.sep) && filePath !== appFolder) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "File not found" });
  res.sendFile(filePath);
});

router.post("/uninstall", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { appId } = req.body;

  if (!appId) {
    return res.status(400).json({ error: "Missing appId" });
  }

  // Security: Prevent uninstalling system apps
  if (appId.startsWith("sys.")) {
    return res.status(403).json({ error: "Cannot uninstall system apps" });
  }

  try {
    // Check if app exists and belongs to user
    const app = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM apps WHERE id = ? AND user_id = ?",
        [appId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });

    if (!app) {
      return res
        .status(404)
        .json({ error: "App not found or not owned by user" });
    }

    // Delete from database
    await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM apps WHERE id = ? AND user_id = ?",
        [appId, userId],
        function (err) {
          if (err) reject(err);
          else resolve();
        },
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM filetypes WHERE app_id = ? AND user_id = ?",
        [appId, userId],
        function (err) {
          if (err) reject(err);
          else resolve();
        },
      );
    });

    // Delete app files
    const appDir = path.join(
      __dirname,
      "../data",
      String(userId),
      "Applications",
      appId,
    );
    if (fs.existsSync(appDir)) {
      fs.rmSync(appDir, { recursive: true, force: true });
    }

    // Delete app config files
    const configDir = path.join(
      __dirname,
      "../data",
      String(userId),
      "config",
      appId,
    );
    if (fs.existsSync(configDir)) {
      fs.rmSync(configDir, { recursive: true, force: true });
    }

    // Check if any other users still have this app installed
    const remainingApp = await new Promise((resolve, reject) => {
      db.get(
        "SELECT 1 FROM apps WHERE id = ? LIMIT 1",
        [appId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // If no other user has the app, clean up the plugin
    if (!remainingApp) {
      await new Promise((resolve, reject) => {
        db.run("DELETE FROM plugins WHERE id = ?", [appId], function (err) {
          if (err) reject(err);
          else resolve();
        });
      });

      const pluginPath = path.join(__dirname, "../plugins", `${appId}.js`);
      // Optional: also clean up .mjs if you chose that extension
      const pluginMjsPath = path.join(__dirname, "../plugins", `${appId}.mjs`);
      
      if (fs.existsSync(pluginPath)) fs.rmSync(pluginPath, { force: true });
      if (fs.existsSync(pluginMjsPath)) fs.rmSync(pluginMjsPath, { force: true });
    }

    res.json({ success: true, message: "App uninstalled successfully" });
  } catch (error) {
    console.error("Failed to uninstall app:", error);
    res.status(500).json({ error: error.message || "Uninstallation failed" });
  }
});

router.post("/install", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { app, packageUrl } = req.body;

  if (!app || !packageUrl) {
    return res.status(400).json({ error: "Missing app or packageUrl" });
  }

  const appId = app.id;

  // Validate required fields
  if (!appId || !app.name || !app.entryPoint) {
    return res
      .status(400)
      .json({ error: "Missing required fields: id, name, entryPoint" });
  }

  // Security: Validate app ID format (prevent path traversal)
  if (!/^[a-zA-Z0-9._-]+$/.test(appId)) {
    return res.status(400).json({ error: "Invalid app ID format" });
  }

  // Security: Validate package URL (HTTPS only, trusted domains)
  let parsedUrl;
  try {
    parsedUrl = new URL(packageUrl);
  } catch (e) {
    return res.status(400).json({ error: "Invalid package URL" });
  }

  if (parsedUrl.protocol !== "https:") {
    return res.status(400).json({ error: "Package URL must use HTTPS" });
  }

  // Allowlist of trusted domains for app packages
  const trustedDomains = ["jcionx.github.io", "github.com"];
  const isTrusted = trustedDomains.some(
    (domain) =>
      parsedUrl.hostname === domain ||
      parsedUrl.hostname.endsWith("." + domain),
  );

  if (!isTrusted) {
    return res.status(400).json({ error: "Untrusted package source" });
  }

  const appDir = path.join(
    __dirname,
    "../data",
    String(userId),
    "Applications",
    appId,
  );

  try {
    // Check if app already exists
    const existingApp = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM apps WHERE id = ? AND user_id = ?",
        [appId, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });

    if (existingApp) {
      return res.status(400).json({ error: "App already installed" });
    }

    // Create app directory
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    // Download and unzip the app
    const protocol = packageUrl.startsWith("https") ? https : http;
    const MAX_DOWNLOAD_SIZE = 100 * 1024 * 1024; // 100MB limit

    await new Promise((resolve, reject) => {
      protocol
        .get(packageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }

          let downloadedSize = 0;

          // Monitor download size
          response.on("data", (chunk) => {
            downloadedSize += chunk.length;
            if (downloadedSize > MAX_DOWNLOAD_SIZE) {
              response.destroy();
              reject(new Error("Package exceeds maximum size limit (100MB)"));
            }
          });

          const unzipStream = unzipper.Parse();

          // Sanitize extracted file paths to prevent path traversal
          unzipStream.on("entry", (entry) => {
            const fileName = entry.path;
            const targetPath = path.join(appDir, fileName);

            // Security: Ensure the file is within appDir (prevent path traversal)
            const normalizedTarget = path.normalize(targetPath);
            const normalizedAppDir = path.normalize(appDir);

            if (
              !normalizedTarget.startsWith(normalizedAppDir + path.sep) &&
              normalizedTarget !== normalizedAppDir
            ) {
              console.warn(`Blocked path traversal attempt: ${fileName}`);
              entry.autodrain();
              return;
            }

            // Create directory if needed
            if (entry.type === "Directory") {
              fs.mkdirSync(targetPath, { recursive: true });
              entry.autodrain();
            } else {
              // Ensure parent directory exists
              fs.mkdirSync(path.dirname(targetPath), { recursive: true });
              entry.pipe(fs.createWriteStream(targetPath));
            }
          });

          unzipStream.on("close", resolve);
          unzipStream.on("error", reject);
          response.pipe(unzipStream);
        })
        .on("error", reject);
    });

    // Add app to database with optional fields
    const permissions = app.permissions
      ? JSON.stringify(app.permissions)
      : null;
    const localePayload = normalizeLocale(app.locale || app.nameLocale);
    const nameLocale = localePayload ? JSON.stringify(localePayload) : null;
    const filetypes = normalizeFiletypes(app.filetypes);

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO apps (id, user_id, name, version, entry_point, icon_path, allow_resize, allow_maximize, default_width, default_height, min_width, min_height, max_width, max_height, default_x, default_y, borderless, permissions, name_locale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          appId,
          userId,
          app.name,
          app.version || null,
          app.entryPoint,
          app.iconPath || null,
          app.allowResize !== undefined ? (app.allowResize ? 1 : 0) : null,
          app.allowMaximize !== undefined ? (app.allowMaximize ? 1 : 0) : null,
          app.defaultWidth || null,
          app.defaultHeight || null,
          app.minWidth || null,
          app.minHeight || null,
          app.maxWidth || null,
          app.maxHeight || null,
          app.defaultX || null,
          app.defaultY || null,
          app.borderless !== undefined ? (app.borderless ? 1 : 0) : null,
          permissions,
          nameLocale,
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        },
      );
    });

    if (filetypes.length > 0) {
      await Promise.all(
        filetypes.map(
          (filetype) =>
            new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO filetypes (user_id, app_id, filetype, "default") VALUES (?, ?, ?, 0) ON CONFLICT(user_id, app_id, filetype) DO NOTHING',
                [userId, appId, filetype],
                function (err) {
                  if (err) reject(err);
                  else resolve();
                },
              );
            }),
        ),
      );
    }

    if (app.pluginUrl && app.pluginHash) {
      // Save or update file pluginUrl to <appid>.js under /plugins if the hash matches
      const pluginPath = path.join(
        __dirname,
        "../plugins",
        `${appId}.js`,
      );

      const pluginResponse = await new Promise((resolve, reject) => {
        protocol.get(app.pluginUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download plugin: ${response.statusCode}`));
            return;
          }

          const data = [];
          response.on("data", (chunk) => data.push(chunk));
          response.on("end", () => resolve(Buffer.concat(data)));
        }).on("error", reject);
      });

      const crypto = require("crypto");
      const hash = crypto.createHash("sha256").update(pluginResponse).digest("hex");

      if (hash !== app.pluginHash) {
        throw new Error("Plugin hash mismatch");
      }

      fs.writeFileSync(pluginPath, pluginResponse);

      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO plugins (id, enabled) VALUES (?, 0) ON CONFLICT(id) DO NOTHING",
          [appId],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log(`Plugin ${appId} downloaded and saved successfully. Run "node cli.js plugin enable ${appId}" to enable it.`);
    }

    res.json({ success: true, message: "App installed successfully." });
  } catch (error) {
    console.error("Failed to install app:", error);

    // Clean up on error
    if (fs.existsSync(appDir)) {
      fs.rmSync(appDir, { recursive: true, force: true });
    }

    res.status(500).json({ error: error.message || "Installation failed" });
  }
});

module.exports = router;
