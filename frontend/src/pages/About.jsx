import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* 🔵 Hero Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">About FairHireQuest</h1>
          <p className="text-gray-600 text-lg">
            Revolutionizing hiring with AI-driven fairness, speed, and accuracy. 🚀
          </p>
        </div>

        {/* 🧭 Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">🎯 Our Mission</h2>
            <p className="text-gray-700">
              To empower businesses and jobseekers with AI tools that eliminate bias, simplify hiring,
              and ensure the right match every time.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">🌍 Our Vision</h2>
            <p className="text-gray-700">
              We imagine a world where talent wins — not connections. Where every applicant gets a fair shot,
              and companies find perfect-fit hires with ease.
            </p>
          </div>
        </div>

        {/* 💡 What Makes Us Unique */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-blue-700 mb-4">💡 What Makes FairHireQuest Special?</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✅ AI-powered job matching engine</li>
            <li>🕶️ Anonymous resume screening (blind hiring)</li>
            <li>📊 Real-time employer dashboards & insights</li>
            <li>🧠 Smart resume builder for candidates</li>
            <li>📱 Mobile-first, user-friendly experience</li>
            <li>🌐 Designed for diversity, equity & inclusion</li>
          </ul>
        </div>

        {/* 👥 Team (Optional placeholder) */}
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold text-blue-700 mb-2">👥 Meet the Team</h2>
          <p className="text-gray-600 italic">
            A passionate group of developers, designers, and recruiters on a mission to fix broken hiring.
            <br />
            (Full team info coming soon!)
          </p>
        </div>

        {/* 🙌 Call to Action */}
        <div className="text-center mt-10">
          <h3 className="text-2xl font-bold text-blue-700 mb-2">Ready to make hiring fair & fast?</h3>
          <p className="text-gray-600 mb-4">Join FairHireQuest today and be part of the future of recruitment.</p>
          <a
            href="/register"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
