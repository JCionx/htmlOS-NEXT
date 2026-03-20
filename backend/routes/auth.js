const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
// 1. UPDATED IMPORT: Destructure both the db and the seeder function
const { db, seedUserData } = require("../db");
const router = express.Router();
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username and password required");

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, row) => {
      if (err || !row) return res.status(400).send("Invalid credentials");

      const match = await bcrypt.compare(password, row.password);
      if (match) {
        // 3. RUN SEEDER ON LOGIN
        // This acts as a self-healing mechanism for future defaults
        seedUserData(row.id);

        // generate token
        const token = jwt.sign(
          { id: row.id, username: row.username },
          JWT_SECRET,
          { expiresIn: "7d" },
        );

        res.cookie("token", token, {
          httpOnly: true,
          //sameSite: 'none',
          //secure: true,
          sameSite: "Strict",
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ ok: true, user: { id: row.id } });
      } else {
        res.status(400).send("Invalid credentials");
      }
    },
  );
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  res.json({ ok: true });
});

// CHECK AUTH
router.get("/check", (req, res) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    res.json({ ok: true, user });
  });
});

// GET CURRENT USER
router.get("/user", (req, res) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    db.get(
      "SELECT id, username FROM users WHERE id = ?",
      [decoded.id],
      (err, user) => {
        if (err || !user)
          return res.status(404).json({ error: "User not found" });
        res.json({ id: user.id, username: user.username });
      },
    );
  });
});

// CHANGE USERNAME
router.post("/change-username", (req, res) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    const { newUsername } = req.body;
    if (!newUsername)
      return res.status(400).json({ error: "New username required" });

    if (newUsername.length < 3 || newUsername.length > 50) {
      return res
        .status(400)
        .json({ error: "Username must be between 3 and 50 characters" });
    }

    db.run(
      "UPDATE users SET username = ? WHERE id = ?",
      [newUsername, decoded.id],
      function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return res.status(400).json({ error: "Username already exists" });
          }
          return res.status(500).json({ error: "Failed to change username" });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Generate new token with updated username
        const newToken = jwt.sign(
          { id: decoded.id, username: newUsername },
          JWT_SECRET,
          { expiresIn: "7d" },
        );
        res.cookie("token", newToken, {
          httpOnly: true,
          sameSite: "Strict",
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ ok: true, message: "Username changed successfully" });
      },
    );
  });
});

// CHANGE PASSWORD
router.post("/change-password", async (req, res) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    db.get(
      "SELECT password FROM users WHERE id = ?",
      [decoded.id],
      async (err, user) => {
        if (err || !user)
          return res.status(404).json({ error: "User not found" });

        // Verify current password
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
          return res
            .status(401)
            .json({ error: "Current password is incorrect" });
        }

        try {
          // Hash new password
          const salt = await bcrypt.genSalt(10);
          const newHash = await bcrypt.hash(newPassword, salt);

          db.run(
            "UPDATE users SET password = ? WHERE id = ?",
            [newHash, decoded.id],
            (err) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: "Failed to change password" });
              }

              res.json({ ok: true, message: "Password changed successfully" });
            },
          );
        } catch (error) {
          res.status(500).json({ error: "Failed to hash password" });
        }
      },
    );
  });
});

module.exports = router;
