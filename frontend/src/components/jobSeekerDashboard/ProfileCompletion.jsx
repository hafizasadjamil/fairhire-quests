import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

export default function ProfileCompletion({ user }) {
  const fields = [
    { label: "Bio", value: user?.bio },
    { label: "Skills", value: user?.skills?.length > 0 },
    { label: "Phone Number", value: user?.phone },
    { label: "Profile Picture", value: user?.avatarUrl },
    { label: "Resume", value: user?.resumeUrl },
  ];

  const completedFields = fields.filter((field) => field.value);
  const progress = Math.round((completedFields.length / fields.length) * 100);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
        🎯 Profile Completion
      </h2>

      <div className="flex flex-col items-center">
        <div className="w-24">
          <CircularProgressbar
            value={progress}
            styles={buildStyles({
              textSize: "16px",
              pathColor: "#3b82f6",
              textColor: "#111827",
              trailColor: "#e5e7eb",
            })}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {fields.map((field, index) => (
          <li key={index} className="flex items-center gap-2">
            {field.value ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaRegCircle className="text-purple-400" />
            )}
            <span
              className={field.value ? "text-gray-800" : "text-gray-500 line-through"}
            >
              {field.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
