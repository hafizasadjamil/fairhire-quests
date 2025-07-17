import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function EditProfile() {
  const { setProfile, refreshProfile } = useAuth();

  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
    skills: [],
    education: [{ degree: "", institution: "", year: "" }],
    experience: [{ title: "", company: "", years: "" }],
    projects: [{ name: "", description: "" }],
    certifications: [""],
    languages: [""],
    location: "",
    linkedin: "",
    avatarUrl: "",
    resumeUrl: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/jobseeker/profile");
        const data = res.data;

setUser((prev) => ({
  ...prev,
  name: data.name || "",
  phone: data.phone || "",
  email: data.email || "",
  bio: data.bio || "",
  location: data.location || "",
  linkedin: data.linkedin || "",
  avatarUrl: data.avatarUrl || "",
  resumeUrl: data.resumeUrl || "",
  skills: Array.isArray(data.skills) ? data.skills : [],
  education: Array.isArray(data.education) && data.education.length > 0 ? data.education : [{ degree: "", institution: "", year: "" }],
  experience: Array.isArray(data.experience) && data.experience.length > 0 ? data.experience : [{ title: "", company: "", years: "" }],
  projects: Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : [{ name: "", description: "" }],
  certifications: Array.isArray(data.certifications) && data.certifications.length > 0
  ? data.certifications
  : [{ name: "", description: "" }],
  languages: Array.isArray(data.languages) ? data.languages : [""],
}));

      } catch {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, field, value, key) => {
    const updated = [...user[key]];
    if (typeof updated[index] === "object") {
      updated[index][field] = value;
    } else {
      updated[index] = value;
    }
    setUser({ ...user, [key]: updated });
  };

  const addSkill = () => {
    if (newSkill && !user.skills.includes(newSkill)) {
      setUser({ ...user, skills: [...user.skills, newSkill] });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setUser({ ...user, skills: user.skills.filter((s) => s !== skillToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const jsonFields = ["skills", "education", "experience", "projects", "certifications", "languages"];
    const fieldsToIgnore = ["avatarUrl", "resumeUrl"];
    const token = localStorage.getItem("token");
  
    for (const key in user) {
      if (fieldsToIgnore.includes(key)) continue;
  
      let value = user[key];
  
      if (key === "certifications") {
        // Normalize certification objects to { name, description }
        value = value.map((cert) => ({
          name: cert.name || cert.Name || "",
          description: cert.description || cert.Description || "",
        }));
      }
  
      const shouldAppend =
        value &&
        (typeof value === "string"
          ? value.trim() !== ""
          : Array.isArray(value)
          ? value.length > 0
          : true);
  
      if (shouldAppend) {
        if (jsonFields.includes(key)) {
          try {
            formData.append(key, JSON.stringify(value));
          } catch{
            console.error(`❌ Failed to stringify ${key}`, value);
          }
        } else {
          formData.append(key, value);
        }
      }
    }
  
    if (avatar) formData.append("avatar", avatar);
    if (resume) formData.append("resume", resume);
  
    try {
      await api.post("/jobseeker/upload-profile-files", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success("Profile updated!");
      await refreshProfile();
    } catch (err) {
      toast.error("Update failed");
      console.error("❌ Profile update error:", err);
    }
  };
  

  return (
    <section className="min-h-screen bg-blue-50 flex justify-center items-start pt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl space-y-5" encType="multipart/form-data">
        <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">Edit Profile</h2>

        {/* Basic Info */}
        <div>
          <label className="font-medium">Full Name</label>
          <input type="text" name="name" value={user.name} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="font-medium">Phone Number</label>
          <input type="text" name="phone" value={user.phone} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="font-medium">Email</label>
          <input type="email" name="email" value={user.email} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="font-medium">Bio</label>
          <textarea name="bio" value={user.bio} onChange={handleChange} rows={3} className="w-full p-2 border rounded" />
        </div>

        {/* Skills */}
        <div>
          <label className="font-medium">Skills</label>
          <div className="flex gap-2 mt-1">
            <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Add a skill" />
            <button type="button" onClick={addSkill} className="bg-blue-600 text-white px-4 rounded">Add</button>
          </div>
          <div className="flex flex-wrap mt-2 gap-2">
            {user.skills.map((skill, i) => (
              <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {skill}
                <button onClick={() => removeSkill(skill)} type="button" className="ml-2 text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <label className="font-medium">Education</label>
          {user.education.map((edu, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input placeholder="Degree" value={edu.degree} onChange={(e) => handleArrayChange(i, "degree", e.target.value, "education")} className="p-2 border rounded" />
              <input placeholder="Institution" value={edu.institution} onChange={(e) => handleArrayChange(i, "institution", e.target.value, "education")} className="p-2 border rounded" />
              <input placeholder="Year" value={edu.year} onChange={(e) => handleArrayChange(i, "year", e.target.value, "education")} className="p-2 border rounded" />
            </div>
          ))}
        </div>

        {/* ✅ Experience */}
        <div>
          <label className="font-medium">Experience</label>
          {user.experience.map((exp, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input
                placeholder="Job Title"
                value={exp.title}
                onChange={(e) => handleArrayChange(i, "title", e.target.value, "experience")}
                className="p-2 border rounded"
              />
              <input
                placeholder="Company"
                value={exp.company}
                onChange={(e) => handleArrayChange(i, "company", e.target.value, "experience")}
                className="p-2 border rounded"
              />
              <input
                placeholder="Years"
                value={exp.years}
                onChange={(e) => handleArrayChange(i, "years", e.target.value, "experience")}
                className="p-2 border rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setUser({
                ...user,
                experience: [...user.experience, { title: "", company: "", years: "" }],
              })
            }
            className="text-blue-600 text-sm"
          >
            + Add experience
          </button>
        </div>

        {/* Projects */}
        <div>
          <label className="font-medium">Projects</label>
          {user.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <input placeholder="Project Name" value={proj.name} onChange={(e) => handleArrayChange(i, "name", e.target.value, "projects")} className="w-full p-2 border rounded mb-1" />
              <textarea placeholder="Project Description" value={proj.description} onChange={(e) => handleArrayChange(i, "description", e.target.value, "projects")} className="w-full p-2 border rounded" />
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div>
          <label className="font-medium">Certifications</label>
          {user.certifications.map((cert, i) => (
  <div key={i} className="mb-4">
    <input
      type="text"
      placeholder="Certification Name"
      value={cert.name}
      onChange={(e) => handleArrayChange(i, "name", e.target.value, "certifications")}
      className="w-full p-2 border rounded mb-2"
    />
    <textarea
      placeholder="Certification Description"
      value={cert.description}
      onChange={(e) => handleArrayChange(i, "description", e.target.value, "certifications")}
      className="w-full p-2 border rounded"
    />
    <button
      type="button"
      onClick={() => {
        const updated = user.certifications.filter((_, idx) => idx !== i);
        setUser({ ...user, certifications: updated });
      }}
      className="text-red-500 text-sm mt-1"
    >
      Remove
    </button>
  </div>
))}

<button
  type="button"
  onClick={() =>
    setUser({
      ...user,
      certifications: [...user.certifications, { name: "", description: "" }],
    })
  }
  className="text-blue-600 text-sm"
>
  + Add certification
</button>

        </div>

        {/* Languages */}
        <div>
          <label className="font-medium">Languages</label>
          {user.languages.map((lang, i) => (
            <input key={i} value={lang} onChange={(e) => handleArrayChange(i, "", e.target.value, "languages")} className="w-full p-2 border rounded mb-2" />
          ))}
        </div>

        {/* Location and LinkedIn */}
        <div>
          <label className="font-medium">Location</label>
          <input name="location" value={user.location} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="font-medium">LinkedIn</label>
          <input name="linkedin" value={user.linkedin} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        {/* Files */}
        <div>
          <label className="font-medium">Profile Picture</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
        </div>

        <div>
          <label className="font-medium">Resume File</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} />
          {user.resumeUrl && (
  <a
  href={`http://localhost:5000/uploads/${user.resumeUrl?.split("uploads/")[1]}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 text-sm underline"
>
  View current resume
</a>

)}

        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </section>
  );
}

