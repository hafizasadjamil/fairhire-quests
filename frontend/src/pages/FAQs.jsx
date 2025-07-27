import React, { useState, useEffect } from "react";
import Spinner from "../components/jobSeekerDashboard/Spinner"; // ✅ adjust path if needed

const faqs = [
  {
    question: "What is FairHireQuest?",
    answer:
      "FairHireQuest is an AI-powered recruitment platform designed to make hiring faster, smarter, and fairer for both employers and job seekers.",
  },
  {
    question: "How does the AI-based job matching work?",
    answer:
      "Our intelligent engine analyzes your resume, skills, and preferences to suggest jobs that best fit your profile using advanced natural language processing.",
  },
  {
    question: "What is blind hiring?",
    answer:
      "Blind hiring hides personal details like name, gender, and photo on resumes, helping companies make unbiased decisions purely on skills and experience.",
  },
  {
    question: "Is FairHireQuest free to use?",
    answer:
      "Yes, job seekers can use most features for free. Employers can access basic tools and upgrade to premium plans for advanced features like analytics and branded job pages.",
  },
  {
    question: "Can I edit or update my resume later?",
    answer:
      "Absolutely! You can update, regenerate, or re-upload your resume anytime from your dashboard.",
  },
  {
    question: "How can employers track applications?",
    answer:
      "Employers get a powerful dashboard where they can track applications, view candidate profiles, and download anonymized resumes.",
  },
];

const FAQs = () => {
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-blue-600 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* CTA at the bottom */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-bold text-blue-700 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Feel free to contact our support team anytime.
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

export default FAQs;
