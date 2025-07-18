import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import Spinner from "../components/jobSeekerDashboard/Spinner";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [role, setRole] = useState("jobseeker");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // ⏳ For page spinner

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: ""
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.warn("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const fullName = `${form.firstName} ${form.lastName}`;
      const { data } = await api.post("/auth/register", {
        name: fullName,
        email: form.email,
        password: form.password,
        role,
      });

      login(data.token, data.role);
      toast.success("Account created successfully!");
      navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Page-level loading spinner
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Spinner />
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-teal-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        {/* Role toggle */}
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

        {/* Form */}
        <form onSubmit={submit}>
          {[
            { name: "firstName", placeholder: "First name" },
            { name: "lastName", placeholder: "Last name" },
            { name: "email", placeholder: "Email", type: "email" },
            { name: "password", placeholder: "Password", type: "password" },
            { name: "confirm", placeholder: "Confirm password", type: "password" },
          ].map((inp) => (
            <input
              key={inp.name}
              type={inp.type || "text"}
              name={inp.name}
              placeholder={inp.placeholder}
              required
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size={16} /> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
