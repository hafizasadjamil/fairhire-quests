import {
  Briefcase,
  FileStack,
  CalendarClock,
  UserCheck
} from "lucide-react";

const iconMap = {
  Briefcase,
  FileStack,
  CalendarClock,
  UserCheck
};

export default function StatCard({ title, value, delta, icon }) {
  const Icon = iconMap[icon] || Briefcase;

  return (
    <div className="bg-white p-4 rounded shadow flex items-center gap-4 hover:shadow-md transition duration-200">
      <Icon className="text-blue-600" size={32} />
      <div>
        <h4 className="text-sm text-gray-500">{title}</h4>
        <div className="text-xl font-bold">{value}</div>
        <div className={`text-xs ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
          {delta >= 0 ? "+" : ""}{delta} this week
        </div>
      </div>
    </div>
  );
}
