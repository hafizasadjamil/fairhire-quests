// src/pages/PublicJobsList.jsx

import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import PublicNavbar from "../components/PublicNavbar";
import Spinner from "../components/jobSeekerDashboard/Spinner";

export default function PublicJobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Browse Jobs
          </h2>

          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-8"
          />

          {loading ? (
            <div className="flex justify-center mt-12">
              <Spinner />
            </div>
          ) : filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500">No jobs found.</p>
          ) : (
            <ul className="grid gap-6">
              {filteredJobs.map((job) => (
                <li
                  key={job._id}
                  className="bg-white p-5 rounded-2xl shadow-md border hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-gray-800">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {job?.employerId?.name || "Unknown Company"} —{" "}
                    {job.location}
                  </p>

                  {job.requirements?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.requirements.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm mt-2 text-gray-500">
                    Posted on{" "}
                    {new Date(job.createdAt).toLocaleDateString("en-US")}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <a
                      href={`/jobs/${job._id}`}
                      className="text-sm px-4 py-1 rounded-full font-medium bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      View Details →
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
