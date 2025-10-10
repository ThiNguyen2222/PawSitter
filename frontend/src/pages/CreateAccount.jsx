import React, { useState } from "react";
import { Link } from "react-router-dom";
import PawAnimals from "../assets/images/paw-animals.png";
import logo from "../assets/logo.png";

function SignupForm() {
  const [isOwnerSignup, setIsOwnerSignup] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f0e6e4] to-white">
      {/* Logo Header */}
      <div className="container flex justify-between items-center py-8 px-8">
        <Link to="/" className="flex items-center gap-2">
          <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
          <p className="text-2xl font-bold uppercase text-primary">PawSitter</p>
        </Link>
      </div>

      {/* Center Section */}
      <div className="flex flex-1 justify-center items-center gap-12 px-8">
        {/* Signup Box */}
        <div className="w-[430px] bg-white p-8 rounded-2xl shadow-lg transform lg:-translate-x-10 -translate-y-7">
          {/* Header Titles */}
          <div className="flex justify-center mb-4">
            <h2 className="text-3xl font-semibold text-center text-primary">
              {isOwnerSignup
                ? "Create Account as Pet Owner"
                : "Create Account as Pet Sitter"}
            </h2>
          </div>

          {/* Toggle Buttons */}
          <div className="relative flex h-12 mb-6 border border-gray-300 rounded-full overflow-hidden">
            <button
              className={`w-1/2 text-lg font-medium transition-all z-10 ${
                isOwnerSignup ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setIsOwnerSignup(true)}
            >
              Pet Owner
            </button>
            <button
              className={`w-1/2 text-lg font-medium transition-all z-10 ${
                !isOwnerSignup ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setIsOwnerSignup(false)}
            >
              Pet Sitter
            </button>

            {/* Sliding Background */}
            <div
              className={`absolute top-0 h-full w-1/2 rounded-full bg-secondary transition-all duration-300 ${
                isOwnerSignup ? "left-0" : "left-1/2"
              }`}
            ></div>
          </div>

          {/* Signup Form */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-3 bg-secondary text-white rounded-full text-lg font-medium hover:opacity-90 transition"
            >
              {isOwnerSignup
                ? "Sign Up as Pet Owner"
                : "Sign Up as Pet Sitter"}
            </button>
          </form>

          {/* Already Have Account */}
          <div className="text-center mt-4 text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-secondary hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden md:block transform lg:translate-x-10">
          <img
            src={PawAnimals}
            alt="Cute pets"
            className="w-[450px] object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
