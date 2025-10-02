import React, { useState } from "react";
import "./Auth.css";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("owner-login");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // reset error before validation

    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (activeTab.includes("signup") && password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Send to backend API
    alert(`${activeTab.toUpperCase()} submitted successfully!`);
  };

  const renderForm = () => {
    switch (activeTab) {
      case "owner-login":
        return (
          <form id="owner-login-form" onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit">LOGIN</button>
          </form>
        );

      case "sitter-login":
        return (
          <form id="sitter-login-form" onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit">LOGIN</button>
          </form>
        );

      case "owner-signup":
        return (
          <form id="owner-signup-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Full Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
            />
            <button type="submit">SIGN UP</button>
          </form>
        );

      case "sitter-signup":
        return (
          <form id="sitter-signup-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Full Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
            />
            <button type="submit">SIGN UP</button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h2>{activeTab.includes("signup") ? "SIGN UP" : "LOGIN"}</h2>
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === "owner-login" ? "active" : ""}`}
          onClick={() => setActiveTab("owner-login")}
        >
          Owner Login
        </div>
        <div
          className={`tab ${activeTab === "sitter-login" ? "active" : ""}`}
          onClick={() => setActiveTab("sitter-login")}
        >
          Sitter Login
        </div>
        <div
          className={`tab ${activeTab === "owner-signup" ? "active" : ""}`}
          onClick={() => setActiveTab("owner-signup")}
        >
          Owner Signup
        </div>
        <div
          className={`tab ${activeTab === "sitter-signup" ? "active" : ""}`}
          onClick={() => setActiveTab("sitter-signup")}
        >
          Sitter Signup
        </div>
      </div>

      {renderForm()}

      {/* Error message */}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Auth;


