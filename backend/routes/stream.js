// backend/routes/stream.js
import express from "express";
import protect from "../middleware/protect.js";
import serverClient from "../utils/stream.js";

const router = express.Router();

router.post("/token", protect, async (req, res) => {
    try {
      const { id, name } = req.user || {};
  
      if (!id || !name) {
        console.error("Missing user data:", req.user);
        return res.status(400).json({ error: "User ID or name missing" });
      }
  
      const token = serverClient.createToken(id.toString());
  
      // Optional: upsert user if not already created
      await serverClient.upsertUser({ id, name });
  
      res.json({ token, user: { id, name } });
    } catch (err) {
      console.error("Token gen error", err);
      res.status(500).json({ error: "Token generation failed" });
    }
  });
  
// backend/routes/stream.js (add this below /token route)
// ✅ Stream Conversation Route - Final Version
router.get("/conversations", protect, async (req, res) => {
    try {
      const userId = req.user.id.toString(); // 🔐 Ensure string type
  
      const filters = { type: "messaging", members: { $in: [userId] } };
      const sort = [{ last_message_at: -1 }];
  
      const channels = await serverClient.queryChannels(filters, sort, {
        watch: true,
        state: true,
      });
  
      const data = await Promise.all(
        channels.map(async (channel) => {
          const members = Object.values(channel.state.members || {});
          const otherUser = members.find((m) => m.user?.id !== userId)?.user;
  
          // ✅ Skip if self-chat (e.g., only 1 member)
          if (!otherUser || otherUser.id === userId) return null;
  
          return {
            userId: otherUser.id,
            name: otherUser.name || "Anonymous",
            avatarUrl: otherUser.avatar || null,
            lastMessage:
              channel.state.messages?.length > 0
                ? channel.state.messages[channel.state.messages.length - 1]?.text
                : "",
          };
        })
      );
  
      // ❌ Filter out nulls (self-chats)
      res.json(data.filter(Boolean));
    } catch (err) {
      console.error("❌ Conversations route failed:", err);
      res.status(500).json({ error: "Conversation fetch failed" });
    }
  });
  
export default router;
