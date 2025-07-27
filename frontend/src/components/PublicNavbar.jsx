import { Link } from "react-router-dom";
import { useState } from "react";
import { HiOutlineMenu, HiX } from "react-icons/hi";

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold">
          <span className="text-blue-600">FairHire</span>Quest
        </Link>

        {/* Toggle button (right side) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiOutlineMenu />}
        </button>

        {/* Menu */}
        <ul className={`md:flex gap-6 text-sm font-medium ${
          menuOpen ? 'block absolute top-14 right-0 bg-white w-full shadow-md z-50 p-4 space-y-4 text-right' : 'hidden'
        } md:static md:space-y-0 md:bg-transparent md:p-0 md:text-left`}>
          <li><Link to="/" className="block hover:text-blue-600">Home</Link></li>
          <li><Link to="/jobs-public" className="block hover:text-blue-600">Jobs</Link></li>
          <li><Link to="/about" className="block hover:text-blue-600">About</Link></li>
          <li><Link to="/contact" className="block hover:text-blue-600">Contact</Link></li>

          {/* Show login/register inside dropdown only on mobile */}
          <li className="md:hidden"><Link to="/login" className="block hover:text-blue-600">Login</Link></li>
          <li className="md:hidden">
            <Link to="/register" className="block px-4 py-1.5 bg-blue-600 text-white rounded text-sm text-center">
              Get Started
            </Link>
          </li>
        </ul>

        {/* Login / Register (visible only on desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm hover:text-blue-600">Login</Link>
          <Link to="/register" className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm">Get Started</Link>
        </div>
      </nav>
    </header>
  );
}
