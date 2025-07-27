import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../../components/jobSeekerDashboard/Spinner";
import JobSeekerNavbar from "../../components/jobSeekerDashboard/JobSeekerNavbar";
import { useAuth } from "../../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, role, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(res.data);

        const appliedRes = await axios.get(`/api/jobseeker/applied-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const appliedJobIds = appliedRes.data.map((j) => j._id);
        setHasApplied(appliedJobIds.includes(id));
      } catch (err) {
        setError("Failed to load job.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, token]);

  const handleApply = async () => {
    try {
      await axios.post(`/api/jobseeker/apply/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasApplied(true);
      alert("Successfully applied!");
    } catch (err) {
      console.error("Apply failed:", err);
      alert("Application failed. Please try again.");
    }
  };

  const handleMessage = () => {
    if (job?.employerId?._id) {
      navigate(`/jobseeker/chat/${job.employerId._id}`);
    }
  };

  if (loading) {
    return (
      <>
        <JobSeekerNavbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <Spinner />
        </div>
      </>
    );
  }

  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;
  if (!job) return <div className="text-gray-500 text-center py-10">No job found</div>;

  return (
    <>
      <JobSeekerNavbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-200 border-solid">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{job.title}</h1>

          {/* ✅ Employer info */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={job.employerId?.avatarUrl || "/default-avatar.png"}
              alt="Employer"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-gray-800 font-medium">{job.employerId?.name || "Company"}</p>
              <p className="text-sm text-gray-500">{job.location || "No location provided"}</p>
              <p className="text-sm text-gray-400">
                Posted on {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Required Skills</h2>
                <ul className="list-disc list-inside text-gray-700 pl-2">
                  {job.requirements.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Job Type</h2>
              <p className="text-gray-700 capitalize">{job.jobType || "N/A"}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Salary</h2>
              <p className="text-gray-700">{job.salary || "Not disclosed"}</p>
            </div>

            {/* ✅ Apply & Message buttons */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleApply}
                disabled={hasApplied}
                className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-200 ${
                  hasApplied ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {hasApplied ? "Already Applied" : "Apply Now"}
              </button>

              {role === "jobseeker" && user?.id !== job?.employerId?._id && (
                <button
                  onClick={handleMessage}
                  className="w-full py-3 px-4 rounded-md font-semibold border border-blue-500 text-blue-600 hover:bg-blue-50 transition"
                >
                  💬 Message Employer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
