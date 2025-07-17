// routes/notifications.js
import express from "express";
import protect from "../middleware/protect.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// ✅ Fetch notifications with unread count
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Notifications error:", err);
    res.status(500).json({ msg: "Failed to load notifications" });
  }
});

// ✅ Mark one as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ msg: "Marked as read" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to mark as read" });
  }
});


// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ msg: 'Not found' });
    if (!notification.user.equals(req.user._id)) return res.status(403).json({ msg: 'Unauthorized' });

    notification.read = true;
    await notification.save();

    res.json({ msg: 'Marked as read' });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: "Notification not found" });

    // ✅ Check ownership
    if (!notification.userId.equals(req.user._id)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await notification.deleteOne();
    res.json({ msg: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
