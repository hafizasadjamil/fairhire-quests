import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";


export default function EditJobForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
        console.log("Fetched Job:", res.data);
      } catch (err) {
        toast.error("Failed to load job data");
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/jobs/${id}`, job);
      toast.success("Job updated successfully!");
      navigate("/employer/dashboard");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (!job) return null;

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 flex justify-center items-start pt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Edit Job</h2>

        <input
          type="text"
          name="title"
          value={job.title}
          onChange={handleChange}
          placeholder="Job Title"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="location"
          value={job.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="jobType"
          value={job.jobType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>

        <input
          type="text"
          name="salary"
          value={job.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          name="description"
          value={job.description}
          onChange={handleChange}
          placeholder="Job Description"
          rows={4}
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          name="requirements"
          value={job.requirements}
          onChange={handleChange}
          placeholder="Requirements / Skills (comma separated)"
          rows={3}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Job
        </button>
      </form>
    </section>
  );
}