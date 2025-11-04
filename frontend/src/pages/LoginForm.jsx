import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import PawAnimals from "../assets/images/paw-animals.png";
import logo from "../assets/logo.png";

function LoginForm({ onLogin }) {
  const [isOwnerLogin, setIsOwnerLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ username, password });

      // Save token and user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Update AppContent auth state
      if (onLogin) onLogin();

      // Navigate based on role
      if (data.user.role === "OWNER") {
        navigate("/owner/dashboard", { replace: true });
      } else if (data.user.role === "SITTER") {
        navigate("/sitter/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      // Clear any invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setError(
        err.response?.data?.detail ||
          "Invalid username or password. Please try again."
      );
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
      <div className="flex flex-1 justify-center items-center gap-12 px-8 relative">
        {/* Login Box */}
        <div className="w-[430px] bg-white p-8 rounded-2xl shadow-lg transform lg:-translate-x-10 -translate-y-6">
          {/* Header Titles */}
          <div className="flex justify-center mb-4">
            <h2 className="text-3xl font-semibold text-center text-primary">
              {isOwnerLogin ? "Login as Pet Owner" : "Login as Pet Sitter"}
            </h2>
          </div>

          {/* Toggle Buttons */}
          <div className="relative flex h-12 mb-6 border border-gray-300 rounded-full overflow-hidden">
            <button
              type="button"
              className={`w-1/2 text-lg font-medium transition-all z-10 ${
                isOwnerLogin ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setIsOwnerLogin(true)}
            >
              Pet Owner
            </button>
            <button
              type="button"
              className={`w-1/2 text-lg font-medium transition-all z-10 ${
                !isOwnerLogin ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setIsOwnerLogin(false)}
            >
              Pet Sitter
            </button>

            {/* Sliding Background */}
            <div
              className={`absolute top-0 h-full w-1/2 rounded-full bg-secondary transition-all duration-300 ${
                isOwnerLogin ? "left-0" : "left-1/2"
              }`}
            ></div>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-secondary hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-3 bg-secondary text-white rounded-full text-lg font-medium hover:opacity-90 transition"
            >
              {isOwnerLogin ? "Login as Pet Owner" : "Login as Pet Sitter"}
            </button>
          </form>

          {/* Sign up */}
          <div className="text-center mt-4 text-gray-600">
            <span>Don't have an account? </span>
            <Link
              to="/create-account"
              className="text-secondary font-medium hover:underline"
            >
              Sign up
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

export default LoginForm;
