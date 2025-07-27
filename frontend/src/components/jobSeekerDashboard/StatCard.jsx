import * as Icons from "lucide-react";

export default function StatCard({ title, value = 0, delta = "", icon }) {
  const LucideIcon = Icons[icon] || Icons.Circle;

  // Auto add arrow symbol for delta
  const getDeltaSymbol = () => {
    if (!delta || delta === "—") return "";
    if (delta.startsWith("-")) return `↓ ${delta}`;
    if (delta.startsWith("+")) return `↑ ${delta}`;
    return delta;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
      <div className="p-3 bg-blue-100 rounded-full">
        <LucideIcon className="text-blue-600 w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {delta && (
          <p
            className={`text-xs font-medium mt-1 ${
              delta.startsWith("-") ? "text-red-600" : "text-green-600"
            }`}
          >
            {getDeltaSymbol()}
          </p>
        )}
      </div>
    </div>
  );
}
