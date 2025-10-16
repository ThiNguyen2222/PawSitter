import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PawAnimals from "../assets/images/paw-animals.png";
import logo from "../assets/logo.png";
import { registerUser } from "../api/api";

function SignupForm() {
  const [isOwnerSignup, setIsOwnerSignup] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      // Role is based on toggle
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: isOwnerSignup ? "OWNER" : "SITTER",
      };

      // Call backend
      const response = await registerUser(userData);
      console.log("Registration success:", response);

      setMessage("Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      setMessage("Registration failed. Please try again.");
    }
  };

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
              type="button"
              className={`w-1/2 text-lg font-medium transition-all z-10 ${
                isOwnerSignup ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setIsOwnerSignup(true)}
            >
              Pet Owner
            </button>
            <button
              type="button"
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />

            <button
              type="submit"
              className="w-full p-3 bg-secondary text-white rounded-full text-lg font-medium hover:opacity-90 transition"
            >
              {isOwnerSignup
                ? "Sign Up as Pet Owner"
                : "Sign Up as Pet Sitter"}
            </button>
          </form>

          {message && (
            <p className="text-center mt-3 text-gray-700 font-medium">
              {message}
            </p>
          )}

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
