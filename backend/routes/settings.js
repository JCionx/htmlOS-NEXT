const express = require("express");
const router = express.Router();
const { db } = require("../db");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT setting, value FROM settings WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Unable ot fetch settings" });
      }

      const settings = {};
      rows.forEach((row) => {
        settings[row.setting] = row.value;
      });

      res.json(settings);
    },
  );
});

router.post("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { setting, value } = req.body;

  if (!setting || value === undefined) {
    return res.status(400).json({ error: "Setting and value are required" });
  }

  db.run(
    "INSERT INTO settings (user_id, setting, value) VALUES (?, ?, ?) ON CONFLICT(user_id, setting) DO UPDATE SET value = excluded.value",
    [userId, setting, value],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Unable to save setting" });
      }

      res.json({ success: true });
    },
  );
});

module.exports = router;
