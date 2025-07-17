import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function EmployerProfile() {
  const { profile, setProfile, token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    company: "",
    avatar: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  // 🧠 Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, company, avatarUrl, email } = res.data;
        setForm({ name, company, avatar: avatarUrl, email });
        setProfile(res.data);
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [token, setProfile]);

  // 🖼️ Upload Avatar
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/upload/avatar", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = res.data.url;
      setForm((prev) => ({ ...prev, avatar: url }));
      setProfile((prev) => ({ ...prev, avatar: url }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/employer/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data.user); // ✅ only user object
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white shadow-md rounded-md w-full max-w-xl p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">My Profile</h2>

        {/* Avatar Preview */}
        {form.avatar && (
          <div className="flex justify-center mb-4">
            <img
              src={form.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border"
            />
          </div>
        )}

        {/* Upload Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-4 block w-full text-sm text-gray-600"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name || ""}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={form.company || ""}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
          <input
            type="text"
            name="avatar"
            placeholder="Avatar URL"
            value={form.avatar || ""}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
          <input
            type="email"
            value={form.email || ""}
            disabled
            className="w-full border rounded px-4 py-2 bg-gray-100 text-gray-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}


