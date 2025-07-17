// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../../api";
// import { toast } from "react-toastify";
// import Spinner from "../../components/employerDashboard/Spinner";

// export default function ViewAppsPage() {
//   const { id } = useParams(); // Job ID
//   const [applications, setApplications] = useState([]);
//   const [jobTitle, setJobTitle] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const jobRes = await api.get(`/jobs/${id}`);
//         setJobTitle(jobRes.data.title);

//         const appsRes = await api.get(`/jobs/${id}/applications`);
//         setApplications(appsRes.data);
//       } catch (err) {
//         toast.error("Failed to load applications");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   const handleStatusUpdate = async (applicationId, newStatus) => {
//     try {
//       await api.put(`/jobs/applications/${applicationId}/status`, {
//         status: newStatus,
//       });
//       toast.success(`Status updated to ${newStatus}`);
//       const appsRes = await api.get(`/jobs/${id}/applications`);
//       setApplications(appsRes.data);
//     } catch (err) {
//       toast.error("Failed to update status");
//     }
//   };

//   return (
//     <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">
//         Applications for{" "}
//         <span className="text-blue-600">{jobTitle || `Job ID: ${id}`}</span>
//       </h1>

//       {loading ? (
//         <div className="flex justify-center items-center h-48">
//           <Spinner size={40} />
//         </div>
//       ) : (
//         <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
//           <table className="min-w-full text-left text-sm">
//             <thead className="bg-gray-100 text-gray-600 uppercase">
//               <tr>
//                 <th className="p-3">Applicant</th>
//                 <th className="p-3">Skills</th>
//                 <th className="p-3">Status</th>
//                 <th className="p-3">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {applications.map((app, index) => (
//                 <tr
//                   key={app._id}
//                   className="border-b hover:bg-gray-50 transition duration-200"
//                 >
//                   {/* Applicant */}
//                   <td className="p-3 flex items-center gap-2">
//                     <img
//                       src={
//                         app.userId?.avatarUrl?.startsWith("http")
//                           ? app.userId.avatarUrl
//                           : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                       }
//                       alt="avatar"
//                       className="w-8 h-8 rounded-full object-cover border"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src =
//                           "https://cdn-icons-png.flaticon.com/512/149/149071.png";
//                       }}
//                     />
//                     <span className="text-gray-800 font-semibold">
//                       Applicant {index + 1}
//                     </span>
//                   </td>

//                   {/* Skills */}
//                   <td className="p-3">
//                     {app.userId?.skills?.length > 0 ? (
//                       <div className="flex flex-wrap gap-1">
//                         {app.userId.skills.map((skill, i) => (
//                           <span
//                             key={i}
//                             className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
//                           >
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     ) : (
//                       <span className="text-gray-400 italic">No skills</span>
//                     )}
//                   </td>

//                   {/* Status */}
//                   <td className="p-3">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                         app.status === "hired"
//                           ? "bg-green-100 text-green-700"
//                           : app.status === "rejected"
//                           ? "bg-red-100 text-red-600"
//                           : app.status === "interview"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-gray-100 text-gray-600"
//                       }`}
//                     >
//                       {app.status}
//                     </span>
//                   </td>

//                   {/* Actions */}
//                   <td className="p-3">
//                     <div className="flex flex-wrap gap-2">
//                       {["interview", "hired", "rejected"].map((statusOption) => (
//                         <button
//                           key={statusOption}
//                           onClick={() =>
//                             handleStatusUpdate(app._id, statusOption)
//                           }
//                           className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
//                         >
//                           {statusOption}
//                         </button>
//                       ))}

//                       {(app.status === "interview" || app.status === "hired") &&
//                         app.userId?._id && (
//                           <a
//                             href={`/employer/applicant/${app.userId._id}?status=${app.status}`}
//                             className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:underline"
//                           >
//                             View Profile
//                           </a>
//                         )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//               {applications.length === 0 && (
//                 <tr>
//                   <td colSpan={4} className="p-4 text-center text-gray-500">
//                     No applications yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import Spinner from "../../components/employerDashboard/Spinner";

export default function ViewAppsPage() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [mode, setMode] = useState("online");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJobTitle(jobRes.data.title);

        const appsRes = await api.get(`/jobs/${id}/applications`);
        setApplications(appsRes.data);
      } catch (err) {
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await api.put(`/jobs/applications/${applicationId}/status`, {
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
      const appsRes = await api.get(`/jobs/${id}/applications`);
      setApplications(appsRes.data);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const openInterviewModal = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

const handleInterviewConfirm = async () => {
  if (!interviewDate) return toast.error("Please select interview date");

  try {
    await api.put(`/jobs/applications/${selectedApp._id}/status`, {
      status: "interview",
      interviewDate,
      mode,
    });

    toast.success("Interview scheduled");
    setShowModal(false);
    setInterviewDate("");

    const appsRes = await api.get(`/jobs/${id}/applications`);
    setApplications(appsRes.data);
  } catch (err) {
    toast.error("Failed to schedule interview");
  }
};


  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Applications for{" "}
        <span className="text-blue-600">{jobTitle || `Job ID: ${id}`}</span>
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner size={40} />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase">
              <tr>
                <th className="p-3">Applicant</th>
                <th className="p-3">Skills</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr
                  key={app._id}
                  className="border-b hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-3 flex items-center gap-2">
                    <img
                      src={
                        app.userId?.avatarUrl?.startsWith("http")
                          ? app.userId.avatarUrl
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                      }}
                    />
                    <span className="text-gray-800 font-semibold">
                      Applicant {index + 1}
                    </span>
                  </td>

                  <td className="p-3">
                    {app.userId?.skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {app.userId.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No skills</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        app.status === "hired"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : app.status === "interview"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openInterviewModal(app)}
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        interview
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app._id, "hired")}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        hired
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app._id, "rejected")}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        rejected
                      </button>
                      {(app.status === "applied" || app.status === "interview" || app.status === "hired") &&
                        app.userId?._id && (
                          <a
                            href={`/employer/applicant/${app.userId._id}?status=${app.status}`}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:underline"
                          >
                            View Profile
                          </a>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🎯 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800">Schedule Interview</h2>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleInterviewConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
