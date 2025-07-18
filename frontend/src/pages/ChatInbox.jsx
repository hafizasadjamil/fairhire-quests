import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatWrapper from "./ChatWrapper";
import api from "../api";
import { useAuth } from "../context/AuthContext"; // For token (optional)

export default function ChatInbox() {
  const { userId } = useParams(); // From URL
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/stream/conversations");
        console.table(res.data);
        setConversations(res.data);
      } catch (err) {
        console.error("❌ Inbox fetch failed", err);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 border-r overflow-y-auto bg-white">
        <h2 className="text-xl font-semibold p-4">Inbox</h2>
        {conversations.map((c, idx) => (
          <div
            key={`${c.userId}-${idx}`}
            className={`p-4 hover:bg-gray-100 cursor-pointer border-b ${
              userId === c.userId ? "bg-gray-200" : ""
            }`}
            onClick={() => navigate(`/chat/${c.userId}`)}
          >
            <div className="flex items-center gap-3">
              <img
                src={c.avatarUrl || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              <div>
                <p className="font-medium">{c.name || "Anonymous"}</p>
                <p className="text-sm text-gray-500 truncate w-48">
                  {c.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Pane */}
      <div className="flex-1">
        {userId ? (
          <ChatWrapper />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
