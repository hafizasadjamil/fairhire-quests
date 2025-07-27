import React, { useState, useEffect } from "react";
import Spinner from "../components/jobSeekerDashboard/Spinner"; // ✅ adjust path if needed

const PrivacyPolicy = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
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
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Privacy Policy
        </h1>

        <p className="text-gray-700 mb-4">
          At <strong>FairHireQuest</strong>, we respect your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Personal details like name, email, role (jobseeker or employer)</li>
          <li>Resume data, skills, and job preferences</li>
          <li>Employer company details and posted jobs</li>
          <li>Usage logs, feedback, and analytics data</li>
        </ul>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>To match candidates with relevant jobs using AI</li>
          <li>To provide personalized dashboards and recommendations</li>
          <li>To send important updates, job alerts, or system notifications</li>
          <li>To improve our platform's performance and security</li>
        </ul>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          3. Data Sharing & Security
        </h2>
        <p className="text-gray-700 mb-2">
          We do <strong>not sell</strong> your personal data. Your information is securely stored and only accessible to authorized personnel. Anonymized data may be used for analytics.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          4. Your Rights
        </h2>
        <p className="text-gray-700 mb-2">
          You can request to view, update, or delete your personal information anytime by contacting our support team.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          5. Updates to This Policy
        </h2>
        <p className="text-gray-700 mb-2">
          We may update this Privacy Policy from time to time. All changes will be posted on this page, and we encourage you to review it regularly.
        </p>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Last updated: July 17, 2025
          </p>
          <a
            href="/contact"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Contact Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
