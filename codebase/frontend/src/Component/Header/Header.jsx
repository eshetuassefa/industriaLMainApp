import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div>
      <div className="header fixed top-0 left-0 w-full z-50 bg-white shadow-md transition-all duration-300">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="block transition-transform hover:scale-105"
              >
                <img src={logo} alt="Logo" className="h-12" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link
                      to="/"
                      className="text-gray-700 font-semibold hover:text-blue-500 transition-colors duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="text-gray-700 font-semibold hover:text-blue-500 transition-colors duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300"
                    >
                      About Us
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Login Button */}
              <div>
                <Link
                  to="/login"
                  className="bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* Mobile Menu Toggler */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transition-transform duration-300 ${
                    isMobileMenuOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Fixed version */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-40 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <nav>
          <ul className="flex flex-col space-y-4 p-4">
            <li>
              <Link
                to="/"
                className="block py-2 px-4 text-gray-700 font-semibold hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 px-4 text-gray-700 font-semibold hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                About Us
              </Link>
            </li>
            <li className="mt-2">
              <Link
                to="/login"
                className="block text-center bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition-colors duration-300"
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Header;
