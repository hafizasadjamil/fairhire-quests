import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import JobSeekerNavbar from "../../components/jobSeekerDashboard/JobSeekerNavbar";
import Spinner from "../../components/jobSeekerDashboard/Spinner";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await api.get("/jobseeker/applied-jobs");
      const ids = res.data.map((job) => job._id);
      setAppliedJobIds(ids);
    } catch {}
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get("/jobseeker/saved-jobs");
      const ids = res.data.map((job) => job._id);
      setSavedJobIds(ids);
    } catch {}
  };

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobseeker/apply/${jobId}`);
      toast.success("Applied successfully!");
      setAppliedJobIds((prev) => [...prev, jobId]);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to apply");
    }
  };

  const handleCancelApplication = async (jobId) => {
    try {
      await api.delete(`/jobseeker/unapply/${jobId}`);
      toast.success("Application cancelled");
      setAppliedJobIds((prev) => prev.filter((id) => id !== jobId));
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

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job?.employerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = locationFilter
        ? job.location?.toLowerCase().includes(locationFilter.toLowerCase())
        : true;

      const matchesSkill = skillFilter
        ? job.requirements?.some((s) =>
            s.toLowerCase().includes(skillFilter.toLowerCase())
          )
        : true;

      return matchesSearch && matchesLocation && matchesSkill;
    });

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, skillFilter, jobs]);

  return (
    <>
      <JobSeekerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Available Jobs
          </h2>

          {/* 🔍 Filter Inputs */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <input
              type="text"
              placeholder="Search by title or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Filter by skill"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-4 py-2 border rounded"
            />
          </div>

          {loading ? (
            <div className="flex justify-center mt-12">
              <Spinner />
            </div>
          ) : filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500">
              No jobs match your filters.
            </p>
          ) : (
            <ul className="grid gap-6">
              {filteredJobs.map((job) => (
                <li
                  key={job._id}
                  className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all border"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={
                        job?.employerId?.avatarUrl ||
                        "https://ui-avatars.com/api/?name=Company"
                      }
                      alt="company"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {job?.employerId?.name || "Unknown Company"}
                      </p>
                      <p className="text-sm text-gray-500">{job.location}</p>

                      {/* ✅ Job Type */}
                      {job.jobType && (
                        <p className="text-sm text-purple-600 font-medium">
                          🧾 Job Type: {job.jobType}
                        </p>
                      )}

                      {/* ✅ Salary */}
                      {job.salary && (
                        <p className="text-sm text-green-700 font-medium">
                          💰 Salary: {job.salary}
                        </p>
                      )}

                      {/* ✅ Posted Date */}
                      {job.createdAt && (
                        <p className="text-sm text-gray-500">
                          🗓️ Posted on{" "}
                          {new Date(job.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {job.requirements?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.requirements.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    {appliedJobIds.includes(job._id) ? (
                      <button
                        onClick={() => handleCancelApplication(job._id)}
                        className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium"
                      >
                        Cancel Application
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job._id)}
                        className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700"
                      >
                        Apply Now
                      </button>
                    )}

                    <button
                      onClick={() => handleSave(job._id)}
                      className={`text-sm px-4 py-1 rounded-full font-medium ${
                        savedJobIds.includes(job._id)
                          ? "bg-gray-300 text-gray-800"
                          : "bg-yellow-400 text-black hover:bg-yellow-500"
                      }`}
                    >
                      {savedJobIds.includes(job._id) ? "💾 Saved" : "Save Job"}
                    </button>

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
