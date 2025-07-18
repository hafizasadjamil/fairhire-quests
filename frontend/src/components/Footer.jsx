import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo & About */}
          <div>
            <h2 className="text-xl font-bold text-white">FairHire<span className="text-blue-500">Quest</span></h2>
            <p className="mt-2 text-sm text-gray-400">
              Empowering diversity & inclusion through AI-powered recruitment. Build a fair hiring journey with us.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
                <li><Link to="/" className="block hover:text-blue-600">Home</Link></li>
                <li><Link to="/jobs-public" className="block hover:text-blue-600">Jobs</Link></li>
                <li><Link to="/about" className="block hover:text-blue-600">About</Link></li>
                <li><Link to="/contact" className="block hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faqs" className="hover:text-white">FAQs</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get in Touch</h3>
            <ul className="space-y-2 text-sm">
              <li>📍 Islamabad, Pakistan</li>
              <li>✉️ contact@fairhirequest.com</li>
              <li>📞 +92 300 1234567</li>
              <li className="flex gap-4 mt-2">
                <a href="#" className="hover:text-blue-400">🌐</a>
                <a href="#" className="hover:text-blue-400">🐦</a>
                <a href="#" className="hover:text-blue-400">📘</a>
                <a href="#" className="hover:text-blue-400">💼</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FairHireQuest. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
