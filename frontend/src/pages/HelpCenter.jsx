import React, { useEffect, useState } from "react";
import Spinner from "../components/jobSeekerDashboard/Spinner"; // ✅ Update path if different

const HelpCenter = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 py-16 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Help Center
        </h1>

        <p className="text-gray-700 text-center mb-8">
          We're here to help you! Browse the most common issues and solutions below, or contact our support team for personalized assistance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "🔐 Login & Account Issues",
              desc: "Having trouble signing in or resetting your password? Learn how to recover access to your account and update your credentials.",
            },
            {
              title: "📄 Resume Upload or Generation",
              desc: "Need help uploading your resume or using the Smart Resume Builder? We’ve got step-by-step guides and tips.",
            },
            {
              title: "💼 Applying to Jobs",
              desc: "Understand how to apply for jobs, track your applications, and get notified of new opportunities.",
            },
            {
              title: "📊 Employer Dashboard",
              desc: "Guidance for employers on posting jobs, managing applicants, and using analytics tools effectively.",
            },
            {
              title: "🔍 AI Job Matching",
              desc: "Learn how our AI engine works and how to improve your profile for better job recommendations.",
            },
            {
              title: "📨 Contacting Support",
              desc: "Can't find your answer? Reach out to our dedicated support team for fast, friendly assistance.",
            },
          ].map((section, i) => (
            <div
              key={i}
              className="bg-blue-50 rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-blue-700 mb-2">
                {section.title}
              </h2>
              <p className="text-gray-700">{section.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <h3 className="text-xl font-bold text-blue-700 mb-2">
            Still stuck?
          </h3>
          <p className="text-gray-600 mb-4">
            Feel free to contact us via email or live chat.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
