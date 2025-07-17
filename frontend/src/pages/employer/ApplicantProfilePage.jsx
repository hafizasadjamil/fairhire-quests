import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import Spinner from "../../components/employerDashboard/Spinner";

export default function ApplicantProfile() {
  const { userId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isHired = status === "hired";

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setApplicant(res.data);
      } catch (err) {
        setError("Failed to load applicant profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (!applicant) return <p className="text-gray-500 text-center mt-6">No applicant data found.</p>;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

        {/* Avatar & Info */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={
              isHired && applicant.avatarUrl
                ? applicant.avatarUrl
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-300 shadow"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isHired ? applicant.name : "Anonymous Applicant"}
            </h2>
            <p className="text-gray-600">
              {isHired ? applicant.email : "Email hidden"}
            </p>
            {isHired && applicant.phone && (
              <p className="text-gray-700">{applicant.phone}</p>
            )}
             {/* 💬 Always show Message button */}
  <div className="mt-3">
    <a
      href={`/chat/${userId}`}
      className="inline-block px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
    >
      💬 Message
    </a>
  </div>
          </div>
        </div>

        {/* Bio */}
        {applicant.bio && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Bio:</h3>
            <p className="text-gray-700">{applicant.bio}</p>
          </div>
        )}

        {/* Skills */}
        {applicant.skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {Array.isArray(applicant.education) && applicant.education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Education:</h3>
            <ul className="list-disc list-inside text-gray-700">
              {applicant.education.map((edu, idx) => (
                <li key={idx}>
                  {edu.degree} at {edu.institution} ({edu.year})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Experience */}
        {Array.isArray(applicant.experience) && applicant.experience.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Experience:</h3>
            <ul className="list-disc list-inside text-gray-700">
              {applicant.experience.map((exp, idx) => (
                <li key={idx}>
                  {exp.title} at {exp.company} ({exp.years} years)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Certifications */}
        {applicant.certifications?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Certifications:</h3>
            <ul className="list-disc list-inside text-gray-700">
              {applicant.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages */}
        {applicant.languages?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Languages:</h3>
            <p className="text-gray-700">{applicant.languages.join(", ")}</p>
          </div>
        )}

        {/* Projects */}
        {applicant.projects?.length > 0 && (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">Projects:</h3>
    <ul className="list-disc list-inside text-gray-700">
      {applicant.projects.map((proj, idx) => (
        <li key={proj._id || idx}>
          <span className="font-medium">{proj.name}</span>: {proj.description}
        </li>
      ))}
    </ul>
  </div>
)}
      </div>
    </div>
  );
}
