import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../api";
import Spinner from "../../components/employerDashboard/Spinner"; // check this path

export default function PostJobForm() {
  const { token, role } = useAuth();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [job, setJob] = useState({
    title: "",
    location: "",
    jobType: "Full-time", // ✅ Fixed name
    salary: "",
    description: "",
    requirements: "", // string input, will convert to array
  });

  // ✅ Show spinner on page load
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== "employer") return toast.error("Only employers can post jobs");

    setLoading(true);
    try {
const jobData = {
  ...job,
  requirements: job.requirements
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r !== ""),
};

await api.post("/jobs/create", jobData, {
  headers: { Authorization: `Bearer ${token}` },
});


      toast.success("Job posted successfully!");
      navigate("/employer/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Page Loading Spinner
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 flex justify-center items-start pt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Post a New Job
        </h2>

        <input
          type="text"
          name="title"
          placeholder="Job Title"
          className="w-full p-2 border rounded"
          value={job.title}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          className="w-full p-2 border rounded"
          value={job.location}
          onChange={handleChange}
          required
        />

        <select
          name="jobType"
          className="w-full p-2 border rounded"
          value={job.jobType}
          onChange={handleChange}
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>

        <input
          type="text"
          name="salary"
          placeholder="Salary (e.g. 80k/month)"
          className="w-full p-2 border rounded"
          value={job.salary}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Job Description"
          className="w-full p-2 border rounded"
          rows={4}
          value={job.description}
          onChange={handleChange}
          required
        />

        <textarea
          name="requirements"
          placeholder="Required Skills (e.g. React, Node, MongoDB)"
          className="w-full p-2 border rounded"
          rows={3}
          value={job.requirements}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size={20} />
              <span>Posting...</span>
            </>
          ) : (
            "Post Job"
          )}
        </button>
      </form>
    </section>
  );
}
