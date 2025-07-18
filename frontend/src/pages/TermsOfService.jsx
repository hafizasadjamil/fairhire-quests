import React, { useState, useEffect } from "react";
import Spinner from "../components/jobSeekerDashboard/Spinner"; // ✅ Adjust path if needed

const TermsOfService = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
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
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Terms of Service
        </h1>

        <p className="text-gray-700 mb-4">
          These Terms of Service govern your use of the FairHireQuest platform.
          By using our services, you agree to these terms in full.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          1. User Responsibilities
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>You must provide accurate and truthful information.</li>
          <li>Keep your login credentials secure and confidential.</li>
          <li>Use the platform for lawful and professional purposes only.</li>
        </ul>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          2. Fair Use Policy
        </h2>
        <p className="text-gray-700 mb-2">
          We reserve the right to limit or suspend access for misuse of our
          tools, spam, or behavior that disrupts the platform or other users.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          3. Intellectual Property
        </h2>
        <p className="text-gray-700 mb-2">
          All content, branding, and technology used in FairHireQuest is
          protected under intellectual property laws. You may not copy, reuse,
          or resell our assets without permission.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          4. Termination
        </h2>
        <p className="text-gray-700 mb-2">
          We reserve the right to suspend or terminate your account at any time
          for violation of these terms or illegal activity.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          5. Disclaimer
        </h2>
        <p className="text-gray-700 mb-2">
          FairHireQuest provides services "as is" without warranties of any
          kind. We do not guarantee job placement or hiring outcomes.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mt-6 mb-2">
          6. Changes to Terms
        </h2>
        <p className="text-gray-700 mb-2">
          We may update these Terms from time to time. Continued use of the
          platform constitutes acceptance of the new terms.
        </p>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Last updated: July 17, 2025
          </p>
          <a
            href="/contact"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
