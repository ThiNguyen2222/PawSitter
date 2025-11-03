import React, { useEffect, useState } from "react";
import axios from "axios";

const SitterDashboardPage = ({ sitterId }) => {
  const [sitterProfile, setSitterProfile] = useState({});
  const [userInfo, setUserInfo] = useState({ user: "", email: "" });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!sitterId) return;

    // Fetch sitter profile
    axios.get(`http://localhost:3000/api/sitters/${sitterId}/`)
      .then(res => {
        const data = res.data;
        setSitterProfile(data);
        if (data.user) setUserInfo({ user: data.user.username, email: data.user.email });
      })
      .catch(err => console.error("Error fetching sitter profile:", err));
  }, [sitterId]);

  // Handle profile field changes
  const handleProfileChange = (e) => {
    setSitterProfile({ ...sitterProfile, [e.target.name]: e.target.value });
  };

  // Handle user field changes
  const handleUserChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    let newErrors = {};
    if (!sitterProfile.display_name) newErrors.display_name = "Display name is required.";
    if (!userInfo.user) newErrors.user = "Username is required.";
    if (userInfo.email && !/\S+@\S+\.\S+/.test(userInfo.email))
      newErrors.email = "Invalid email format.";
    if (password && password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save sitter profile
  const saveProfile = () => {
    if (!validateInputs()) return;

    axios.put(`http://localhost:3000/api/sitters/${sitterId}/`, sitterProfile)
      .then(() => alert("Profile updated successfully!"))
      .catch(err => console.error("Error updating profile:", err));
  };

  // Save user account info
  const saveUser = () => {
    if (!validateInputs()) return;

    axios.put(`http://localhost:3000/api/users/${sitterId}/`, {
      user: userInfo.user,
      email: userInfo.email,
      password: password,
    })
    .then(() => {
      alert("User info updated!");
      setPassword(""); 
    })
    .catch(err => console.error("Error updating user info:", err));
  };

  return (
    <div>
      <h1>Sitter Dashboard</h1>

      <h2>Edit Profile</h2>
      <input
        type="text"
        name="display_name"
        value={sitterProfile.display_name || ""}
        onChange={handleProfileChange}
        placeholder="Display Name"
      />
      {errors.display_name && <p style={{ color: "red" }}>{errors.display_name}</p>}

      <textarea
        name="bio"
        value={sitterProfile.bio || ""}
        onChange={handleProfileChange}
        placeholder="Bio"
      />

      <input
        type="number"
        name="rate_hourly"
        value={sitterProfile.rate_hourly || ""}
        onChange={handleProfileChange}
        placeholder="Rate per Hour"
      />

      <input
        type="number"
        name="service_radius_km"
        value={sitterProfile.service_radius_km || ""}
        onChange={handleProfileChange}
        placeholder="Service Radius (km)"
      />

      <input
        type="text"
        name="home_zip"
        value={sitterProfile.home_zip || ""}
        onChange={handleProfileChange}
        placeholder="Home Zip"
      />

      <input
        type="text"
        name="verification_status"
        value={sitterProfile.verification_status || ""}
        onChange={handleProfileChange}
        placeholder="Verification Status"
      />

      <button onClick={saveProfile}>Save Profile</button>

      <h2>Edit Account Info</h2>
      <input
        type="text"
        name="user"
        value={userInfo.user || ""}
        onChange={handleUserChange}
        placeholder="Username"
      />
      {errors.user && <p style={{ color: "red" }}>{errors.user}</p>}

      <input
        type="email"
        name="email"
        value={userInfo.email || ""}
        onChange={handleUserChange}
        placeholder="Email"
      />
      {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

      <button onClick={saveUser}>Save Account</button>
    </div>
  );
};

export default SitterDashboardPage;
