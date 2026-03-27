const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

function emitDismiss(io, userId, appId, excludeSocketId) {
  const payload = { appId };
  if (typeof excludeSocketId === "string" && excludeSocketId.length > 0) {
    io.to(`user:${userId}`).except(excludeSocketId).emit("continuity:dismiss", payload);
  } else {
    io.to(`user:${userId}`).emit("continuity:dismiss", payload);
  }
}

router.post("/start", authenticateToken, (req, res) => {
  const userId = String(req.user.id);
  const { appId, data } = req.body || {};

  if (typeof appId !== "string" || appId.length === 0) {
    return res.status(400).json({ error: "Invalid appId" });
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an object" });
  }

  const continuityStore = req.app.locals.continuityStore;
  const io = req.app.locals.io;
  const sourceSocketId = req.headers["x-continuity-socket-id"];

  if (!continuityStore || !io) {
    return res.status(500).json({ error: "Continuity service unavailable" });
  }

  if (!continuityStore.has(userId)) {
    continuityStore.set(userId, new Map());
  }

  const updatedAt = Date.now();
  continuityStore.get(userId).set(appId, {
    data,
    updatedAt,
    sourceSocketId:
      typeof sourceSocketId === "string" && sourceSocketId.length > 0
        ? sourceSocketId
        : null,
  });

  const payload = {
    appId,
    data,
    updatedAt,
  };

  if (typeof sourceSocketId === "string" && sourceSocketId.length > 0) {
    io.to(`user:${userId}`).except(sourceSocketId).emit("continuity:update", payload);
  } else {
    io.to(`user:${userId}`).emit("continuity:update", payload);
  }

  return res.json({ success: true, appId, updatedAt });
});

router.post("/consume", authenticateToken, (req, res) => {
  const userId = String(req.user.id);
  const { appId } = req.body || {};
  const consumerSocketId = req.headers["x-continuity-socket-id"];

  if (typeof appId !== "string" || appId.length === 0) {
    return res.status(400).json({ error: "Invalid appId" });
  }

  const continuityStore = req.app.locals.continuityStore;
  const io = req.app.locals.io;

  if (!continuityStore || !io) {
    return res.status(500).json({ error: "Continuity service unavailable" });
  }

  const userContinuity = continuityStore.get(userId);
  const entry = userContinuity?.get(appId);

  if (!entry) {
    return res.json({ success: true, consumed: false });
  }

  if (
    typeof entry.sourceSocketId === "string" &&
    entry.sourceSocketId.length > 0 &&
    entry.sourceSocketId !== consumerSocketId
  ) {
    // Deprecated path retained for backward compatibility of stored entries.
  }

  // Always notify all other same-user clients so rapid re-advertise races
  // cannot cause missed "go home" transitions on the source device.
  io
    .to(`user:${userId}`)
    .except(typeof consumerSocketId === "string" ? consumerSocketId : "")
    .emit("continuity:consumed", { appId });

  userContinuity.delete(appId);
  if (userContinuity.size === 0) {
    continuityStore.delete(userId);
  }

  emitDismiss(
    io,
    userId,
    appId,
    typeof consumerSocketId === "string" ? consumerSocketId : undefined,
  );

  return res.json({ success: true, consumed: true });
});

router.post("/dismiss", authenticateToken, (req, res) => {
  const userId = String(req.user.id);
  const { appId } = req.body || {};
  const sourceSocketId = req.headers["x-continuity-socket-id"];

  if (typeof appId !== "string" || appId.length === 0) {
    return res.status(400).json({ error: "Invalid appId" });
  }

  const continuityStore = req.app.locals.continuityStore;
  const io = req.app.locals.io;

  if (!continuityStore || !io) {
    return res.status(500).json({ error: "Continuity service unavailable" });
  }

  const userContinuity = continuityStore.get(userId);
  if (!userContinuity || !userContinuity.has(appId)) {
    return res.json({ success: true, dismissed: false });
  }

  userContinuity.delete(appId);
  if (userContinuity.size === 0) {
    continuityStore.delete(userId);
  }

  emitDismiss(
    io,
    userId,
    appId,
    typeof sourceSocketId === "string" ? sourceSocketId : undefined,
  );

  return res.json({ success: true, dismissed: true });
});

module.exports = router;
