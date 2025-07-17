import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";

const JobRow = ({ job, applicationCount = 0 }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${job._id}`);
      toast.success("Job deleted");
      window.location.reload();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-2 px-3">{job.title}</td>
      <td className="py-2 px-3">{job.location}</td>
      <td className="py-2 px-3">{applicationCount}</td>
      <td className="py-2 px-3">Active</td>
      <td className="py-2 px-3 space-x-2">
        <button
          onClick={() => navigate(`/employer/edit-job/${job._id}`)}
          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => navigate(`/employer/job/${job._id}`)}
          className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
        >
          View Apps
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default JobRow;
