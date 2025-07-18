import { useEffect, useState } from "react";
import api from "../../api";
import Spinner from "../../components/jobSeekerDashboard/Spinner";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const [appliedRes, savedRes] = await Promise.all([
          api.get("/jobseeker/applied-jobs"),
          api.get("/jobseeker/saved-jobs"),
        ]);
        setAppliedJobs(appliedRes.data);
        setSavedJobs(savedRes.data.map((j) => j._id));
      } catch (err) {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, []);

  const toggleSave = async (jobId) => {
    try {
      const res = await api.post(`/jobseeker/save/${jobId}`);
      if (savedJobs.includes(jobId)) {
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
        toast.info("Job unsaved");
      } else {
        setSavedJobs([...savedJobs, jobId]);
        toast.success("Job saved");
      }
    } catch (err) {
      toast.error("Failed to toggle saved job");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Applied Jobs
        </h2>

        {loading ? (
          <Spinner />
        ) : appliedJobs.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven’t applied to any jobs yet.
          </p>
        ) : (
          <ul className="grid gap-6">
            {appliedJobs.map((job) => (
              <li
                key={job._id}
                className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4 mb-2">
                  <img
                    src={job.avatar || "https://ui-avatars.com/api/?name=Company"}
                    alt="company avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {job.company || "No company name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {job.location || "No location"}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <span className="inline-block text-green-700 text-sm bg-green-100 px-2 py-1 rounded">
                    ✅ Applied
                  </span>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Job →
                  </Link>
                  <button
                    onClick={() => toggleSave(job._id)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      savedJobs.includes(job._id)
                        ? "bg-gray-200 text-gray-800"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {savedJobs.includes(job._id) ? "💾 Saved" : "💾 Save Job"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
