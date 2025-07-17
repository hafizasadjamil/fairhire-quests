import { useEffect, useState } from "react";
import ChatConversation from "../components/ChatConversation";
import { useParams } from "react-router-dom";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import api from "../api";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const client = StreamChat.getInstance(apiKey);

export default function ChatWrapper() {
  const { userId } = useParams(); // ID of the person you're chatting with
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.post("/stream/token");
        const { token, user } = res.data;
  
        console.log("✅ Logged-in user:", user);
        console.log("👤 Target user from URL:", userId);
  
        if (!client.user) {
          await client.connectUser(user, token);
        }
  
        // ❗ Important check
        if (!user.id || !userId || user.id === userId) {
          console.warn("⚠️ Cannot create channel with self or invalid ID");
          return;
        }
  
        const chatId = [user.id, userId].sort().join("-");
        const members = [...new Set([user.id, userId])];
  
        console.log("💬 Creating chatId:", chatId);
        console.log("👥 Members:", members);
  
        const newChannel = client.channel("messaging", chatId, { members });
  
        await newChannel.watch();
        console.log("✅ Channel is ready:", newChannel?.data);
  
        setChannel(newChannel);
      } catch (err) {
        console.error("❌ Stream Init Error", err);
      }
    };
  
    init();
  
    return () => {
      if (client.user) client.disconnectUser();
    };
  }, [userId]);
  
  

  if (!channel) return <div className="p-4">🔄 Loading chat...</div>;

  return (
    <Chat client={client} theme="messaging light">
      <ChatConversation channel={channel} />
    </Chat>
  );
}
