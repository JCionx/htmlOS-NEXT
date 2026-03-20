const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const archiver = require("archiver");

// Configure multer to store files in disk temporarily
const tempUploadPath = path.join(__dirname, "../temp_uploads");
if (!fs.existsSync(tempUploadPath)) {
  fs.mkdirSync(tempUploadPath, { recursive: true });
}
const upload = multer({ dest: tempUploadPath });

// list files in a path inside user's home directory
const { authenticateToken } = require("../middleware/authenticateToken");

router.post("/list", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const requestedPath = req.body.path || "";

  const safePath = Array.isArray(requestedPath)
    ? requestedPath.join("/")
    : requestedPath;

  const userHome = path.join(__dirname, "../data", String(userId));
  const targetPath = path.resolve(userHome, safePath);

  if (!targetPath.startsWith(userHome)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  fs.readdir(targetPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to read directory" });
    }

    const fileList = files
      .filter((file) => file.name !== ".DS_Store")
      .map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
      }));

    res.json(fileList);
  });
});

router.post("/save", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const requestedPath = req.body.path;
  const content = req.body.content;

  if (!requestedPath || typeof content === "undefined") {
    return res.status(400).json({ error: "Missing path or content" });
  }

  const safePath = Array.isArray(requestedPath)
    ? requestedPath.join("/")
    : requestedPath;
  const userHome = path.join(__dirname, "../data", String(userId));
  const targetPath = path.resolve(userHome, safePath);

  if (!targetPath.startsWith(userHome)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  // Ensure the directory exists
  const dir = path.dirname(targetPath);
  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to create directory" });
    }

    // Write the file
    // If content is base64, decode it; otherwise, write as string/buffer
    let bufferToWrite;
    if (typeof content === "string" && req.body.encoding === "base64") {
      bufferToWrite = Buffer.from(content, "base64");
    } else {
      bufferToWrite = content;
    }

    fs.writeFile(targetPath, bufferToWrite, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Unable to save file" });
      }
      res.json({ success: true, path: safePath });
    });
  });
});

router.post("/move", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const oldPath = req.body.oldPath;
  const newPath = req.body.newPath;

  if (!oldPath || !newPath) {
    return res.status(400).json({ error: "Missing oldPath or newPath" });
  }

  const safeOldPath = Array.isArray(oldPath) ? oldPath.join("/") : oldPath;
  const safeNewPath = Array.isArray(newPath) ? newPath.join("/") : newPath;
  const userHome = path.join(__dirname, "../data", String(userId));
  const targetOldPath = path.resolve(userHome, safeOldPath);
  const targetNewPath = path.resolve(userHome, safeNewPath);

  if (
    !targetOldPath.startsWith(userHome) ||
    !targetNewPath.startsWith(userHome)
  ) {
    return res.status(400).json({ error: "Invalid path" });
  }

  fs.rename(targetOldPath, targetNewPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to move file" });
    }
    res.json({ success: true, oldPath: safeOldPath, newPath: safeNewPath });
  });
});

router.post("/delete", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const requestedPath = req.body.path;

  if (!requestedPath) {
    return res.status(400).json({ error: "Missing path" });
  }

  const safePath = Array.isArray(requestedPath)
    ? requestedPath.join("/")
    : requestedPath;
  const userHome = path.join(__dirname, "../data", String(userId));
  const targetPath = path.resolve(userHome, safePath);

  if (!targetPath.startsWith(userHome)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  fs.rm(targetPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to delete file or folder" });
    }
    res.json({ success: true, path: safePath });
  });
});

router.post("/create-folder", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const requestedPath = req.body.path;

  if (!requestedPath) {
    return res.status(400).json({ error: "Missing path" });
  }

  const safePath = Array.isArray(requestedPath)
    ? requestedPath.join("/")
    : requestedPath;
  const userHome = path.join(__dirname, "../data", String(userId));
  const targetPath = path.resolve(userHome, safePath);

  if (!targetPath.startsWith(userHome)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  fs.mkdir(targetPath, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to create folder" });
    }
    res.json({ success: true, path: safePath });
  });
});

router.post("/upload", authenticateToken, upload.single("file"), (req, res) => {
  const userId = req.user.id;
  const requestedPath = req.body.path;
  const file = req.file;

  if (!requestedPath || !file) {
    if (file && file.path) fs.unlink(file.path, () => {}); // Cleanup
    return res.status(400).json({ error: "Missing path or file" });
  }

  const safePath = Array.isArray(requestedPath)
    ? requestedPath.join("/")
    : requestedPath;
  const userHome = path.join(__dirname, "../data", String(userId));
  const targetFolder = path.resolve(userHome, safePath);
  const targetPath = path.join(targetFolder, file.originalname);

  if (!targetPath.startsWith(userHome)) {
    if (file.path) fs.unlink(file.path, () => {}); // Cleanup
    return res.status(400).json({ error: "Invalid path" });
  }

  // Move the file from temp location to target location
  fs.rename(file.path, targetPath, (err) => {
    if (err) {
      // If rename fails (e.g. across partitions), try copy and delete
      if (err.code === "EXDEV") {
        fs.copyFile(file.path, targetPath, (copyErr) => {
          if (copyErr) {
            console.error("Copy error:", copyErr);
            fs.unlink(file.path, () => {}); // Try to clean up temp
            return res.status(500).json({ error: "Unable to save file" });
          }
          fs.unlink(file.path, () => {}); // Clean up temp
          return res.json({ success: true, path: targetPath });
        });
        return;
      }

      console.error("Rename error:", err);
      fs.unlink(file.path, () => {}); // Try to clean up temp
      return res.status(500).json({ error: "Unable to save file" });
    }
    res.json({ success: true, path: targetPath });
  });
});

router.post("/copy", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const oldPath = req.body.oldPath;
  const newPath = req.body.newPath;

  if (!oldPath || !newPath) {
    return res.status(400).json({ error: "Missing oldPath or newPath" });
  }

  const safeOldPath = Array.isArray(oldPath) ? oldPath.join("/") : oldPath;
  const safeNewPath = Array.isArray(newPath) ? newPath.join("/") : newPath;
  const userHome = path.join(__dirname, "../data", String(userId));
  const targetOldPath = path.resolve(userHome, safeOldPath);
  const targetNewPath = path.resolve(userHome, safeNewPath);

  if (
    !targetOldPath.startsWith(userHome) ||
    !targetNewPath.startsWith(userHome)
  ) {
    return res.status(400).json({ error: "Invalid path" });
  }

  // copy file or folder
  fs.cp(targetOldPath, targetNewPath, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to copy file or folder" });
    }
    res.json({ success: true, oldPath: safeOldPath, newPath: safeNewPath });
  });
});

router.post("/download-folder", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const requestedPath = req.body.path;

  if (!requestedPath) {
    return res.status(400).json({ error: "Missing path" });
  }

  const safePath = Array.isArray(requestedPath)
    ? requestedPath.join("/")
    : requestedPath;
  const userHome = path.join(__dirname, "../data", String(userId));
  const targetPath = path.resolve(userHome, safePath);

  if (!targetPath.startsWith(userHome)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  // Verify it exists and is a directory
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    return res.status(400).json({ error: "Target is not a directory" });
  }

  // Generate zip
  const token = crypto.randomBytes(16).toString("hex");
  const zipName = path.basename(targetPath) + ".zip";
  const tempZipPath = path.join(tempUploadPath, `${token}-${zipName}`);

  const output = fs.createWriteStream(tempZipPath);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", function () {
    // Zip created, register in tempFiles map
    tempFiles.set(token, {
      path: tempZipPath,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    res.json({ url: `/data/temp/${token}?download=true` });
  });

  archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
      console.warn(err);
    } else {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: "Zip error" });
    }
  });

  archive.on("error", function (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: "Zip error" });
  });

  archive.pipe(output);
  archive.directory(targetPath, path.basename(targetPath));
  archive.finalize();
});

// Temporary storage for generated temp file URLs

const tempFiles = new Map();

router.get("/temp/:token", authenticateToken, (req, res) => {
  const { token } = req.params;
  const entry = tempFiles.get(token);

  if (!entry || Date.now() > entry.expiresAt) {
    return res.status(404).send("File not found or expired");
  }

  if (req.query.download === "true") {
    const filename = path.basename(entry.path);
    res.download(entry.path, filename);
  } else {
    // Explicitly set mime type for m4a if needed, though sendFile usually handles it.
    // Some browsers prefer audio/mp4 for m4a.
    if (entry.path.endsWith(".m4a")) {
      res.setHeader("Content-Type", "audio/mp4");
    }
    res.sendFile(entry.path);
  }
});

// Parent requests a temp URL
router.post("/temp", authenticateToken, (req, res) => {
  const { path: requestedPath } = req.body;
  const token = crypto.randomBytes(16).toString("hex");

  const PROJECT_ROOT = path.resolve(__dirname, "..");
  const targetPath = path.join(
    PROJECT_ROOT,
    "data",
    String(req.user.id),
    requestedPath,
  );
  // Set expiration 1 hour
  tempFiles.set(token, {
    path: targetPath,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  res.json({ url: `/data/temp/${token}` });
});

module.exports = router;
