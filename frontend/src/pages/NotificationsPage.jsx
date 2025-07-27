import { useNotification } from "../context/NotificationContext";
import { useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const { notifications, fetchNotifications } = useNotification();
  const { token } = useAuth();
  const navigate = useNavigate();

  const markAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNotifications(); // refresh list
      if (link) navigate(link);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNotifications(); // refresh
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Notifications</h2>
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3 border rounded flex justify-between items-start cursor-pointer ${
                !n.read ? "bg-blue-50" : "bg-white"
              }`}
            >
              <div onClick={() => markAsRead(n._id, n.link)}>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => deleteNotification(n._id)}
                className="text-red-500 text-xs ml-4"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
