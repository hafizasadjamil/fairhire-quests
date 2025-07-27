// backend/routes/stream.js
import express from "express";
import protect from "../middleware/protect.js";
import serverClient from "../utils/stream.js";
import User from "../models/User.js"; 

const router = express.Router();

// /routes/stream.js

router.post("/token", protect, async (req, res) => {
  try {
    const { id, name, avatarUrl } = req.user || {};
    const { otherUserId } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "User ID or name missing" });
    }

    const token = serverClient.createToken(id.toString());

    // 🧑‍💻 Upsert current (logged-in) user
    await serverClient.upsertUser({
      id,
      name,
      image: avatarUrl || null,
    });

    // 📦 Fetch and upsert the other user (if provided)
    if (otherUserId) {
      const otherUser = await User.findById(otherUserId); // ✅ Get from DB

      if (!otherUser) {
        console.warn("⚠️ Other user not found in DB:", otherUserId);
      }

      await serverClient.upsertUser({
        id: otherUserId,
        name: otherUser?.name || `User-${otherUserId}`,
        image: otherUser?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      });
    }

    res.json({ token, user: { id, name, avatarUrl } });
  } catch (err) {
    console.error("❌ Token gen error:", err.message || err);
    res.status(500).json({ error: "Token generation failed" });
  }
});



router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = req.user.id.toString();

    const filters = { type: "messaging", members: { $in: [userId] } };
    const sort = [{ last_message_at: -1 }];

    const channels = await serverClient.queryChannels(filters, sort, {
      watch: true,
      state: true,
    });

    const data = await Promise.all(
      channels.map(async (channel) => {
        const members = Object.values(channel.state?.members || {});
        const otherUser = members.find((m) => m.user?.id !== userId)?.user;

        if (!otherUser || otherUser.id === userId) return null;

        console.log("✅ image:", otherUser?.image);

        return {
          userId: otherUser.id,
          name: otherUser.name || "Anonymos",
          avatarUrl: otherUser.image || "/default-avatar.png", // fallback
          lastMessage:
            channel.state?.messages?.length > 0
              ? channel.state.messages[channel.state.messages.length - 1]?.text
              : "No messages yet",
        };
      })
    );

    res.json(data.filter(Boolean));
  } catch (err) {
    console.error("❌ Conversations route failed:", err);
    res.status(500).json({ error: "Conversation fetch failed" });
  }
});
  
export default router;
