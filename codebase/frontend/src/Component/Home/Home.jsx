import React from "react";
import { Link } from "react-router-dom";
import patient from "../../assets/images/patient.png";

// create row function

const Home = () => {
  return (
    <div className="home">
      <section className="min-h-screen flex flex-col items-center justify-center ml-5 p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-4xl font-bold text-blue-700">
              Welcome to the E-Health patient Record System!
            </h1>
            <p className="text-gray-700 text-lg">
              Our innovative platform empowers patients and healthcare providers
              with secure access to manage and share health information
              effortlessly. Experience comprehensive health management, enhanced
              security, and seamless communication—all designed to put you in
              control of your health journey.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold transition"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div>
            <img
              src={patient}
              alt="Health Care Illustration"
              className="rounded-lg shadow-lg my-10"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
