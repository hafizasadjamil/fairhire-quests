import express from "express";
import User from "../models/User.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// 📨 1. Send message
router.post("/send", protect, async (req, res) => {
  try {
    const msg = new Message({
      senderId: req.user.id,
      receiverId: req.body.receiverId,  // ✅ this must match
      content: req.body.content,
    });

    const saved = await msg.save();
    res.json(saved);
  } catch (err) {
    console.error("❌ Message send error:", err);
    res.status(500).json({ error: "Send failed" });
  }
});

// 💬 2. Fetch conversation with someone
router.get("/conversation/:userId", protect, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 🧾 3. My chat list
router.get("/my-conversations", protect, async (req, res) => {
  try {
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== myId) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== myId) userIds.add(msg.receiver.toString());

    });

    const users = await User.find({ _id: { $in: [...userIds] } }).select(
      "_id name avatarUrl"
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

export default router;
