import React, { useState, useEffect } from "react";
import Spinner from "../components/jobSeekerDashboard/Spinner"; // 🔁 Adjust if needed

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been sent. We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-teal-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Contact Us
        </h1>
        <p className="text-gray-700 text-center mb-8">
          Have a question or feedback? We'd love to hear from you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="border rounded-md p-3 focus:outline-blue-500 col-span-1"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border rounded-md p-3 focus:outline-blue-500 col-span-1"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
            className="border rounded-md p-3 focus:outline-blue-500 md:col-span-2"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition md:col-span-2"
          >
            Send Message
          </button>
        </form>

        <div className="mt-10 text-center">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Or reach out directly:
          </h3>
          <p className="text-gray-700">
            Email: <a href="mailto:support@fairhirequest.com" className="text-blue-600 underline">support@fairhirequest.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
