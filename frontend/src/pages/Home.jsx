import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/jobSeekerDashboard/Spinner";

const Home = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading (e.g. for fetching data, animations, etc.)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second

    return () => clearTimeout(timer);
  }, []);

       if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Spinner />
      </div>
    )
  }

  return (


    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* 🟦 Hero Section */}
        <div className="bg-white shadow-lg rounded-2xl p-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
            Welcome to <span className="text-black">FairHireQuest</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Your AI-powered recruitment platform for faster, smarter, and fairer hiring.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>
        </div>

        {/* 🧭 Role Quick Access */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/login"
            className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Employer</h3>
            <p className="text-sm text-gray-600">
              Post jobs, track candidates & build your hiring brand.
            </p>
          </Link>
          <Link
            to="/login"
            className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Job Seeker</h3>
            <p className="text-sm text-gray-600">
              Upload your resume, get AI-based job matches instantly.
            </p>
          </Link>
        </div>

        {/* 🌟 Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <h4 className="text-lg font-bold text-blue-600">🔍 Smart Matching</h4>
            <p className="text-gray-600 mt-2">Get tailored job suggestions based on your CV & skills.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <h4 className="text-lg font-bold text-blue-600">🕶️ Blind Hiring</h4>
            <p className="text-gray-600 mt-2">Reduce bias with anonymized resume screening for employers.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <h4 className="text-lg font-bold text-blue-600">📊 Employer Dashboard</h4>
            <p className="text-gray-600 mt-2">Track applicants, manage listings, and view analytics.</p>
          </div>
        </div>

        {/* 💬 Testimonials */}
        <div className="bg-white shadow-md rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-blue-700">What Our Users Say</h3>
          <p className="italic text-gray-600">
            “FairHireQuest helped me find a job that matched my resume perfectly. Super impressed!”
          </p>
          <p className="text-sm text-gray-500 mt-2">– Ayesha R., Jobseeker</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
