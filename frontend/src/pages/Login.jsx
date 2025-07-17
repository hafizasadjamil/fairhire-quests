import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import Spinner from "../components/jobSeekerDashboard/Spinner";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [role, setRole] = useState("jobseeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // Custom AuthContext

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // POST request to /api/auth/login with role
      const { data } = await api.post("/auth/login", { email, password });

      // ⛔ NOTE: Role server se aata hai, input se nahi
      // ✅ Save token and user info in context
      login(data.token, data.role);

      toast.success("Logged in successfully!");

      // 🔀 Navigate based on actual user role from backend
      if (data.role === "employer") {
        navigate("/employer/dashboard");
      } else if (data.role === "jobseeker") {
        navigate("/jobseeker/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-teal-50">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8"
      >
        {/* Role display toggle (UI only) */}
        <div className="grid grid-cols-2 mb-6 rounded-t-lg overflow-hidden">
          {["jobseeker", "employer"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 text-sm font-medium transition ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "jobseeker" ? "Job Seeker" : "Employer"}
            </button>
          ))}
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-md p-2 mb-3 focus:outline-blue-500 outline"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-md p-2 mb-6 focus:outline-blue-500 outline"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Spinner size={16} /> : "Sign In"}
        </button>

        <p className="text-center text-sm mt-4">
          New here?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}
