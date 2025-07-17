import { useEffect } from "react";
import Spinner from "../../components/jobSeekerDashboard/Spinner";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function JobseekerProfile() {
  const { profile, setProfile } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/jobseeker/profile");
        setProfile(res.data); // ✅ sync context
      } catch {
        console.error("Failed to fetch profile");
      }
    };

    // 🔁 Only fetch if context is empty (null)
    if (!profile) fetchProfile();
  }, [profile, setProfile]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-white">
        <Spinner size={40} />
      </div>
    );
  }

  const {
    name,
    email,
    phone,
    avatarUrl,
    bio,
    skills,
    education,
    experience,
    resumeUrl,
    location,
    linkedin,
    certifications,
    languages,
    projects,
  } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 py-10">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
        {/* Avatar and basic info */}
        <div className="flex items-center gap-6">
          <img
            src={avatarUrl || "/default-avatar.png"}
            alt="Avatar"
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-gray-600">{email}</p>
            <p className="text-gray-600">{phone || "No phone added."}</p>
            <p className="text-gray-600">{location || "No location added."}</p>
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm underline"
              >
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="mt-8 space-y-6">
          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Bio</h3>
            <p className="text-gray-700">{bio || "No bio added."}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Skills</h3>
            {skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">No skills added.</p>
            )}
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Education</h3>
            {education?.length > 0 ? (
              <ul className="list-disc pl-6 text-gray-700">
                {education.map((edu, i) => (
                  <li key={i}>
                    <strong>{edu.degree}</strong> at {edu.institution} ({edu.year})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No education info provided.</p>
            )}
          </div>

{/* Experience */}
<div>
  <h3 className="text-lg font-semibold mb-1">Experience</h3>
  {experience?.length > 0 ? (
    <ul className="list-disc pl-6 text-gray-700">
      {experience.map((exp, i) => (
        <li key={i}>
          <strong>{exp.title}</strong> at {exp.company} ({exp.years} years)
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-700">No experience info provided.</p>
  )}
</div>


          {/* Certifications */}
          {/* Certifications */}
<div>
  <h3 className="text-lg font-semibold mb-1">Certifications</h3>
  {certifications?.length > 0 ? (
    <ul className="list-disc pl-6 text-gray-700 space-y-2">
      {certifications.map((c, i) => (
        <li key={i}>
          <strong>{c.name}</strong>: {c.description}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-700">No certifications provided.</p>
  )}
</div>


          {/* Languages */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Languages</h3>
            {languages?.length > 0 ? (
              <p className="text-gray-700">{languages.join(", ")}</p>
            ) : (
              <p className="text-gray-700">No languages added.</p>
            )}
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Projects</h3>
            {projects?.length > 0 ? (
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                {projects.map((proj, i) => (
                  <li key={i}>
                    <strong>{proj.name}</strong>: {proj.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No projects listed.</p>
            )}
          </div>

          {/* Resume */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Resume</h3>
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Resume
              </a>
            ) : (
              <p className="text-gray-700">No resume uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
