import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPasswordByEmail } from "../api/api";
import PawAnimals from "../assets/images/paw-animals.png";
import logo from "../assets/logo.png";

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordByEmail(email, newPassword);
      navigate("/login", {
        state: { message: "Password reset successfully! Please login with your new password." }
      });
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.new_password?.[0] ||
          "Failed to reset password. Please check your email and try again."
      );
    } finally {
      setLoading(false);
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
        {/* Forgot Password Box */}
        <div className="w-[430px] bg-white p-8 rounded-2xl shadow-lg transform lg:-translate-x-10 -translate-y-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-center text-primary mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600 text-center text-sm">
              Enter your email and new password to reset your account.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
            />

            {/* Password Requirements */}
            <div className="text-sm text-gray-500">
              <p>Password must be at least 8 characters long</p>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-secondary text-white rounded-full text-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-secondary font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>←</span> Back to Login
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

export default ForgotPasswordForm;