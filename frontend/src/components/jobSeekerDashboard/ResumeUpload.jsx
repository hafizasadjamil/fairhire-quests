import { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FileUp } from "lucide-react";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadedUrl(""); // reset preview if new file selected
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploading(true);
      const res = await api.post("/jobseeker/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume uploaded successfully!");
      setUploadedUrl(res.data.fileUrl || "");
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <FileUp className="w-5 h-5 text-blue-600" />
        Upload Your Resume
      </h2>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="block w-full border rounded p-2 text-sm"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Resume"}
      </button>

      {uploadedUrl && (
        <div className="mt-4 text-sm">
          ✅ Resume uploaded:{" "}
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Resume
          </a>
        </div>
      )}
    </div>
  );
}
