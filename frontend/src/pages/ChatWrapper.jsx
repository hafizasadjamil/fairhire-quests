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
  let isMounted = true; // 🛡️ protect against premature unmount

  const init = async () => {
    try {
      const res = await api.post("/stream/token", {
        otherUserId: userId,
      });

      const { token, user } = res.data;

      if (!client.userID) {
        await client.connectUser(
          {
            id: user.id,
            name: user.name,
            image: user.avatarUrl,
          },
          token
        );
      }

      if (!user.id || !userId || user.id === userId || !isMounted) return;

      const chatId = [user.id, userId].sort().join("-");
      const members = [...new Set([user.id, userId])];

      const newChannel = client.channel("messaging", chatId, { members });
      await newChannel.watch();

      if (isMounted) setChannel(newChannel);
    } catch (err) {
      console.error("❌ Stream Init Error", err);
    }
  };

  init();

  return () => {
    isMounted = false;
    setChannel(null);

    if (client.userID) {
      setTimeout(() => {
        client.disconnectUser().catch((err) => {
          console.error("⚠️ Disconnect failed:", err);
        });
      }, 300);
    }
  };
}, [userId]);


  if (!channel) return <div className="p-4">🔄 Loading chat...</div>;

  return (
    <Chat client={client} theme="messaging light">
      <ChatConversation channel={channel} />
    </Chat>
  );
}




