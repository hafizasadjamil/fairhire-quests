import { FaBell } from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";
import { Link } from "react-router-dom";

export default function NotificationBell() {
  const { unreadCount } = useNotification();

  return (
    <div className="relative">
      <Link to="/notifications">
        <FaBell className="text-xl text-gray-700 hover:text-blue-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
