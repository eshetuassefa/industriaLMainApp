"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import authService from "@/services/auth.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
      closeMobileMenu();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Extract email prefix and prepend "Hi"
  const getUserDisplayName = () => {
    if (!currentUser || !currentUser.email) return "User";
    const emailPrefix = currentUser.email.split("@")[0];
    return `Hi ${emailPrefix}`;
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
                
                </ul>
              </nav>

              {/* User Info and Button */}
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.firstName || getUserDisplayName()}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(
                            currentUser.firstName || getUserDisplayName()
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500">
                        {currentUser.role || "User"}
                      </p>
                    </div>
                  </div>
                )}
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white py-2 px-5 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Login
                  </Link>
                )}
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

      {/* Mobile Navigation Menu */}
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
           
            {currentUser && (
              <li>
                <div className="flex items-center gap-2 py-2 px-4">
                  <Avatar className="h-8 w-8">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.firstName || getUserDisplayName()}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(
                          currentUser.firstName || getUserDisplayName()
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="text-sm text-gray-500">
                      {currentUser.role || "User"}
                    </p>
                  </div>
                </div>
              </li>
            )}
            <li className="mt-2">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="block text-center bg-red-600 text-white py-2 px-5 rounded-lg hover:bg-red-700 transition-colors duration-300 w-full"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block text-center bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition-colors duration-300"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Header;
