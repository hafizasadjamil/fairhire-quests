import { useEffect, useState } from "react";
import api from "../../api";
import Spinner from "../../components/jobSeekerDashboard/Spinner";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await api.get("/jobseeker/saved-jobs");
        setSavedJobs(res.data);
      } catch (err) {
        toast.error("Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  return (
    <>
      <section className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Saved Jobs</h2>

          {loading ? (
            <Spinner />
          ) : savedJobs.length === 0 ? (
            <p className="text-center text-gray-500">You haven't saved any jobs yet.</p>
          ) : (
            <ul className="grid gap-6">
              {savedJobs.map((job) => (
                <li key={job._id} className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition">
                  <div className="flex items-center gap-4 mb-2">
                    {job.avatar ? (
                      <img src={job.avatar} alt="Company Logo" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                        {job.company?.[0] || "C"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-700">{job.company || "No company name"}</p>
                      <p className="text-sm text-gray-500">{job.location || "No location provided"}</p>
                    </div>
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="mt-2 inline-block text-blue-600 hover:underline text-sm"
                  >
                    View Job →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
