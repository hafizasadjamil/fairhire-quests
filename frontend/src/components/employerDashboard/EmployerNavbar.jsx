import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useState, useEffect, useRef } from "react";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { FaBell } from "react-icons/fa";

export default function EmployerNavbar() {
  const { profile, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotification();

  const navigate = useNavigate();

  const initials =
    profile?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef();
  const avatarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!notifRef.current?.contains(e.target)) setNotifOpen(false);
      if (!avatarRef.current?.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAvatarOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await markNotificationAsRead(id);
      setNotifOpen(false);
      navigate(link);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      await fetchNotifications(); // refresh list
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
            {menuOpen ? <HiX /> : <HiOutlineMenu />}
          </button>
          <Link to="/" className="text-xl font-bold">
            <span className="text-blue-600">FairHire</span>Quest
          </Link>
        </div>

        <ul
          className={`md:flex gap-6 text-sm font-medium ${
            menuOpen
              ? "block absolute top-14 left-0 w-full bg-white shadow-md px-4 py-2 z-40"
              : "hidden"
          } md:static md:bg-transparent md:shadow-none md:py-0 md:px-0 md:mx-auto`}
        >
          <li>
            <Link to="/employer/dashboard" className="block py-2 hover:text-blue-600">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/employer/new-job" className="block py-2 hover:text-blue-600">
              Post Job
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4 relative">
          {/* 🔔 Notifications */}
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative">
              <FaBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md z-50 text-sm max-h-80 overflow-y-auto">
                <div className="p-4 border-b font-medium text-gray-700">Notifications</div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-2 text-gray-500">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 8).map((n, idx) => (
                    <div
                      key={n._id || idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                    >
                      <p>{n.message}</p>
                      <div className="flex justify-between text-xs mt-1">
                        {n.link && (
                          <button
                            onClick={() => handleMarkAsRead(n._id, n.link)}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n._id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 👤 Avatar Dropdown */}
          <div ref={avatarRef} className="relative">
            <button onClick={() => setAvatarOpen(!avatarOpen)}>
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
              )}
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md z-50 text-sm">
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-gray-800">{profile?.name || "Employer"}</p>
                  <p className="text-gray-500 text-xs truncate">{profile?.email}</p>
                </div>
                <Link to="/employer/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
