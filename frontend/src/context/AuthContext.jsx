import { createContext, useContext, useState, useEffect } from "react";
import api from "../api"; // 👈 adjust if needed

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [profile, setProfile] = useState(null);

  // ✅ Fetch profile from backend and normalize keys
  const fetchProfile = async () => {
    if (!token) return;

    try {
      const res = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

setProfile({
  _id: res.data._id,
  name: res.data.name || "",
  email: res.data.email || "",
  phone: res.data.phone || "",
  
  avatarUrl: res.data.avatarUrl || "",
  avatar: res.data.avatarUrl || "",
  resumeUrl: res.data.resumeUrl || "",
  bio: res.data.bio || "",
  skills: res.data.skills || [],
  education: res.data.education || [],
  experience: res.data.experience || [],
  location: res.data.location || "",
  linkedin: res.data.linkedin || "",
  certifications: res.data.certifications || [],
  languages: res.data.languages || [],
  projects: res.data.projects || []
});


    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  // ✅ On mount or token change
  useEffect(() => {
    fetchProfile();
  }, [token]);

  // 🔐 Login
  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setToken(token);
    setRole(role);
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        profile,
        setProfile,
        login,
        logout,
        refreshProfile: fetchProfile, // ✅ exposed in case needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook
export const useAuth = () => useContext(AuthContext);
