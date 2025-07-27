const badge = {
  interview: "bg-green-100 text-green-700",
  shortlisted: "bg-yellow-100 text-yellow-700",
  submitted: "bg-gray-100 text-gray-700"
};

export default function ApplicationsTable({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">No applications found.</p>;
  }

  return (
    <table className="w-full text-sm table-auto">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="py-2">Job</th>
          <th>Status</th>
          <th>Match</th>
        </tr>
      </thead>
      <tbody>
        {data.map((app) => (
          <tr key={app._id} className="border-b last:border-0 hover:bg-gray-50 transition">
            <td className="py-3">
              <p className="font-medium text-gray-900">{app.title}</p>
              <p className="text-gray-500">{app.company}</p>
            </td>
            <td className="whitespace-nowrap">
              <span className={`px-2 py-1 rounded-full text-xs capitalize ${badge[app.status] || 'bg-gray-100 text-gray-600'}`}>
                {app.status || "unknown"}
              </span>
            </td>
            <td className="text-blue-600 text-xs font-semibold">{app.match || 0}% match</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
