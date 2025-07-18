import { useEffect, useState } from "react";
import ChatWrapper from "./ChatWrapper";
import Spinner from "../components/jobSeekerDashboard/Spinner"; // ✅ Use the same spinner

export default function ChatPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate loading delay

    return () => clearTimeout(delay);
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {loading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <Spinner />
        </div>
      ) : (
        <ChatWrapper />
      )}
    </div>
  );
}
