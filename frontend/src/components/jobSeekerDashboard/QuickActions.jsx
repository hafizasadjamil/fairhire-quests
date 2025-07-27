import { Link } from "react-router-dom";
import { Search, Upload, FlaskConical, BarChart3 } from "lucide-react";

const actions = [
  { label: "Search Jobs", icon: Search, path: "/jobs" },
  { label: "Update Resume", icon: Upload, path: "/jobseeker/edit-profile" },
  { label: "Take Skill Test", icon: FlaskConical, path: "/skill-tests" },
  { label: "View Analytics", icon: BarChart3, path: "/analytics" }
];

export default function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h4 className="text-md font-semibold mb-4 text-gray-800">Quick Actions</h4>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition"
          >
            <action.icon className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
