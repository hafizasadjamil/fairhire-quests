import { useEffect, useState } from "react";
import api from "../../api";
import Spinner from "../../components/jobSeekerDashboard/Spinner";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function MatchingJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  // Fetch Data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("/jobseeker/matching-jobs");
        const sortedJobs = res.data.sort((a, b) => a.rank - b.rank);
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs);

        const appliedRes = await api.get("/jobseeker/applied-jobs");
        const savedRes = await api.get("/jobseeker/saved-jobs");
        setAppliedJobIds(appliedRes.data.map((job) => job._id));
        setSavedJobIds(savedRes.data.map((job) => job._id));
      } catch (err) {
        toast.error("Error fetching matched jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Filter Logic
  useEffect(() => {
    const filtered = jobs.filter((job) => {
      const titleMatch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
      const companyMatch = job?.employerId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = locationFilter
        ? job.location.toLowerCase().includes(locationFilter.toLowerCase())
        : true;
      const skillMatch = skillFilter
        ? job.requirements?.some((s) =>
            s.toLowerCase().includes(skillFilter.toLowerCase())
          )
        : true;

      return (titleMatch || companyMatch) && locationMatch && skillMatch;
    });

    setFilteredJobs(filtered);
  }, [searchQuery, locationFilter, skillFilter, jobs]);

  // Apply / Cancel / Save Logic
  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobseeker/apply/${jobId}`);
      setAppliedJobIds((prev) => [...prev, jobId]);
      toast.success("Applied successfully!");
    } catch (err) {
      toast.error("Failed to apply");
    }
  };

  const handleCancel = async (jobId) => {
    try {
      await api.delete(`/jobseeker/unapply/${jobId}`);
      setAppliedJobIds((prev) => prev.filter((id) => id !== jobId));
      toast.success("Application cancelled");
    } catch {
      toast.error("Cancel failed");
    }
  };

  const handleSave = async (jobId) => {
    try {
      await api.post(`/jobseeker/save/${jobId}`);
      if (savedJobIds.includes(jobId)) {
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        toast.info("Job unsaved");
      } else {
        setSavedJobIds((prev) => [...prev, jobId]);
        toast.success("Job saved");
      }
    } catch {
      toast.error("Save/unsave failed");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          🎯 Jobs Matched Based on Your Resume & Skills
        </h1>

        {/* 🔍 Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by title or company"
            className="border border-gray-300 border-solid px-3 py-2 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by location"
            className="border border-gray-300 border-solid px-3 py-2 rounded-lg"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by skill"
            className="border border-gray-300 border-solid px-3 py-2 rounded-lg"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size={40} />
          </div>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500">
            No matching jobs found with selected filters.
          </p>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={job?.employerId?.avatarUrl || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                    <p className="text-sm text-gray-700">{job?.employerId?.name}</p>
                    <p className="text-sm text-gray-600">{job.location}</p>

                    <p className="text-sm text-purple-600 mt-1">
                      🗂 Job Type: <span className="font-medium">{job.jobType}</span>
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      💰 Salary: <span className="font-semibold">{job.salary}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 Posted on {new Date(job.createdAt).toDateString()}
                    </p>

                    {/* Tags */}
                    {job.requirements?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.requirements.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-4 flex gap-3 flex-wrap">
                      {appliedJobIds.includes(job._id) ? (
                        <button
                          onClick={() => handleCancel(job._id)}
                          className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full hover:bg-red-200"
                        >
                          Cancel Application
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(job._id)}
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-700"
                        >
                          Apply Now
                        </button>
                      )}

                      <button
                        onClick={() => handleSave(job._id)}
                        className={`text-sm px-4 py-1 rounded-full font-medium ${
                          savedJobIds.includes(job._id)
                            ? "bg-gray-300 text-gray-800"
                            : "bg-yellow-300 text-black hover:bg-yellow-400"
                        }`}
                      >
                        {savedJobIds.includes(job._id) ? "💾 Saved" : "Save Job"}
                      </button>

                      <Link
                        to={`/jobs/${job._id}`}
                        className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full hover:bg-green-200"
                      >
                        View Details →
                      </Link>
                    </div>

                    {/* Match Reason & Percent */}
                    {job.match_reason && (
                      <p className="text-xs italic text-gray-500 mt-2">
                        🎯 {job.match_reason}
                      </p>
                    )}
                    {job.matchPercent && (
                      <p className="text-sm font-bold text-purple-700 mt-1">
                        Match Score: {job.matchPercent.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
