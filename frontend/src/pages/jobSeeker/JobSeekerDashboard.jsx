import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/jobSeekerDashboard/StatCard";
import ProfileCompletion from "../../components/jobSeekerDashboard/ProfileCompletion";
import QuickActions from "../../components/jobSeekerDashboard/QuickActions";
import Spinner from "../../components/jobSeekerDashboard/Spinner";
import UpcomingEvents from "../../components/jobSeekerDashboard/UpcomingEvents";
import { toast } from "react-toastify";
import api from "../../api";
import { format } from "date-fns";

export default function JobSeekerDashboard() {
  const { profile, token, role } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== "jobseeker") {
      navigate("/login");
    } else {
      const fetchDashboard = async () => {
        try {
          const [dashboardRes, eventRes] = await Promise.all([
            api.get("/jobseeker/dashboard", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/jobseeker/events"),
          ]);

          setData(dashboardRes.data);
          setEvents(eventRes.data);
        } catch (err) {
          console.error("Dashboard failed", err);
          toast.error("Failed to load dashboard");
        } finally {
          setLoading(false);
        }
      };
      fetchDashboard();
    }
  }, [token, role]);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 flex items-center justify-center">
        <Spinner />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50">
      <main className="container px-4 py-10 space-y-10">
      <div className="flex justify-between items-center mb-4">
  <h1 className="text-2xl font-bold">
    Welcome, {profile?.name || "Jobseeker"} 👋
  </h1>
  <Link
    to="/chat"
    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
  >
    💬 Messages
  </Link>
</div>

        {/* ✅ Stat Cards */}
        {Array.isArray(data?.stats) && data.stats.length > 0 && (
          <div className="grid grid-cols- sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.stats.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* ✅ Left Section */}
          <div className="md:col-span-2 space-y-6">
            {/* ✅ Recent Applications */}
            <section className="bg-white shadow rounded-lg p-6 max-h-[300px] overflow-y-auto">
              <header className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Recent Applications</h3>
                <Link
                  to="/jobseeker/applied-jobs"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all
                </Link>
              </header>
              {data?.recentApps?.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Job</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentApps.map((app, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2 font-medium">
                          {app.jobId?.title || "Untitled Job"}
                        </td>
                        <td className="py-2">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-800 capitalize">
                            {app.status}
                          </span>
                        </td>



                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">
                  You haven’t applied to any jobs yet.
                </p>
              )}
            </section>

            {/* Application Status */}
            <section className="bg-white shadow rounded-lg p-6 max-h-[300px] overflow-y-auto">
              <h3 className="font-semibold text-lg mb-4">Application Status</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2">Job Title</th>
                    <th className="px-4 py-2">Company</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt._id} className="border-b">
                      <td className="px-4 py-2">{evt.jobTitle}</td>
                      <td className="px-4 py-2">{evt.employerName}</td>
                      <td className="px-4 py-2">
                        {format(new Date(evt.date), "dd MMM yyyy, h:mm a")}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            evt.type === "hired"
                              ? "bg-green-100 text-green-700"
                              : evt.type === "rejected"
                              ? "bg-red-100 text-red-700"
                              : evt.type === "interview"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {(evt.type || "status")
                            .charAt(0)
                            .toUpperCase() + (evt.type || "status").slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Saved Jobs */}
            <section className="bg-white shadow rounded-lg p-6 max-h-[300px] overflow-y-auto">
              <header className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Saved Jobs</h3>
                <Link
                  to="/jobseeker/saved-jobs"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all
                </Link>
              </header>
              {data?.savedJobs?.length > 0 ? (
                <ul className="text-sm space-y-2 w-full">
                  {data.savedJobs.map((job, i) => (
                    <li key={i} className="border-b py-1">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {job.title || "Untitled Job"}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No saved jobs yet.</p>
              )}
            </section>
          </div>

          {/* ✅ Right Section */}
          <aside className="space-y-6">
            <div className="bg-white rounded shadow p-6 text-center">
              <img
                src={profile?.avatarUrl || "/default-avatar.png"}
                alt="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
                className="w-24 h-24 mx-auto rounded-full object-cover border"
              />
              <h3 className="font-semibold mt-2">
                {data?.user?.name || "Your Name"}
              </h3>
              <p className="text-sm text-gray-500">{data?.user?.email}</p>
              {data?.user?.phone && (
                <p className="text-sm text-gray-700 mt-1">
                  📞 {data.user.phone}
                </p>
              )}
              {Array.isArray(data?.user?.skills) &&
                data.user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center text-xs text-white mt-2">
                    {data.user.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-500 px-2 py-1 rounded-full"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}
              {data?.user?.resumeUrl && (
                <a
                  href={
                    data.user.resumeUrl.includes("cloudinary")
                      ? data.user.resumeUrl
                      : `http://localhost:5000/uploads/${data.user.resumeUrl.split("uploads/")[1]}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                >
                  📄 View Resume
                </a>
              )}
              <Link
                to="/jobseeker/edit-profile"
                className="mt-3 inline-block text-blue-500 text-sm hover:underline"
              >
                ✏️ Edit Profile
              </Link>
            </div>
            <ProfileCompletion user={data.user} />
            <UpcomingEvents events={events} />
            <QuickActions />
          </aside>
        </div>
      </main>
    </section>
  );
}
