import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/employerDashboard/Spinner";
import api from "../../api";
import StatCard from "../../components/employerDashboard/StatCard";
import JobRow from "../../components/employerDashboard/JobRow";
import { toast } from "react-toastify";

export default function EmployerDashboard() {
  const { token, role, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== "employer") {
      toast.error("Access denied");
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await api.get("/employer/dashboard");
        setStats(res.data.stats);
        setJobs(res.data.jobs);
      } catch (err) {
        console.error("Dashboard failed", err);
        toast.error("Dashboard failed");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, role, navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 min-h-screen">
      {/* ✅ Welcome Message */}
      {/* <h1 className="text-2xl font-bold mb-4">Welcome, {profile?.name || "Employer"} 👋</h1>
      <Link to="/chat" className="text-blue-600 underline">
            💬 Open Inbox
          </Link> */}

          <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold mb-4">Welcome, {profile?.name || "Employer"} 👋</h1>
  
           <Link
            to="/chat"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
          >
            💬 Messages
          </Link>
          </div>

      {/* ✅ Stats Overview */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 mb-8">
        <StatCard title="Active Jobs" value={stats.activeJobs} delta={stats.deltaJobs} icon="Briefcase" />
<StatCard title="Applications" value={stats.applications} delta={stats.deltaApps} icon="FileStack" />
<StatCard title="Interviews Set" value={stats.interviews} delta={stats.deltaInter} icon="CalendarClock" />
<StatCard title="Hires" value={stats.hires} delta={stats.deltaHires} icon="UserCheck" />

      </div>

      {/* ✅ Posted Jobs Section */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">📄 My Posted Jobs</h2>
          <button
            onClick={() => navigate("/employer/new-job")}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            + Post a New Job
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="py-3 px-3 text-left">Title</th>
                <th className="py-3 px-3 text-left">Location</th>
                <th className="py-3 px-3 text-left">Applications</th>
                <th className="py-3 px-3 text-left">Status</th>
                <th className="py-3 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
  <JobRow key={j._id} job={j} applicationCount={j.applicationCount || 0} />
))}

            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Company Branding (Placeholder) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">📈 Company Branding</h2>
        <p className="text-sm text-gray-600">
          Add your company mission, values, and upload your logo to build trust with jobseekers.
          <br />
          (This section is coming soon!)
        </p>
      </div>
    </div>
  );
}
