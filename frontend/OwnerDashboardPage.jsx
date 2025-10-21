import React, { useEffect, useState } from "react";

const OwnerDashboardPage = ({ ownerId }) => {
  const [ownerProfile, setOwnerProfile] = useState({});
  const [userInfo, setUserInfo] = useState({ user: "", email: "" });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [pets, setPets] = useState([]);

  useEffect(() => {
    if (!ownerId) return;

    // Fetch owner profile
    fetch(`http://localhost:3000/api/owners/${ownerId}/`)
      .then((res) => res.json())
      .then((data) => {
        setOwnerProfile(data);
        if (data.user) setUserInfo({ user: data.user.username, email: data.user.email });
        if (data.pets) setPets(data.pets);
      })
      .catch((err) => console.error("Error fetching owner profile:", err));
  }, [ownerId]);

  // Profile changes
  const handleProfileChange = (e) => {
    setOwnerProfile({ ...ownerProfile, [e.target.name]: e.target.value });
  };

  // User info changes
  const handleUserChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    let newErrors = {};
    if (!ownerProfile.name) newErrors.name = "Name is required.";
    if (!userInfo.user) newErrors.user = "Username is required.";
    if (userInfo.email && !/\S+@\S+\.\S+/.test(userInfo.email))
      newErrors.email = "Invalid email format.";
    if (password && password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile info
  const saveProfile = () => {
    if (!validateInputs()) return;

    fetch(`http://localhost:3000/api/owners/${ownerId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ownerProfile),
    })
      .then((res) => res.json())
      .then(() => alert("Profile updated successfully!"))
      .catch((err) => console.error("Error updating profile:", err));
  };

  // Save user account info
  const saveUser = () => {
    if (!validateInputs()) return;

    fetch(`http://localhost:3000/api/users/${ownerId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userInfo.user,
        email: userInfo.email,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("User info updated!");
        setPassword(""); 
      })
      .catch((err) => console.error("Error updating user info:", err));
  };

  return (
    <div>
      <h1>Owner Dashboard</h1>

      <h2>Edit Profile</h2>
      <input
        type="text"
        name="name"
        value={ownerProfile.name || ""}
        onChange={handleProfileChange}
        placeholder="Name"
      />
      {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}

      <input
        type="text"
        name="phone"
        value={ownerProfile.phone || ""}
        onChange={handleProfileChange}
        placeholder="Phone"
      />

      <input
        type="text"
        name="default_location"
        value={ownerProfile.default_location || ""}
        onChange={handleProfileChange}
        placeholder="Location"
      />

      <textarea
        name="notes"
        value={ownerProfile.notes || ""}
        onChange={handleProfileChange}
        placeholder="Notes"
      />

      {pets.length > 0 && (
        <>
          <h3>Pets</h3>
          {pets.map((pet) => (
            <div key={pet.id} style={{ marginLeft: "1rem", marginBottom: "1rem" }}>
              <p><strong>Name:</strong> {pet.name}</p>
              <p><strong>Species:</strong> {pet.species}</p>
              <p><strong>Breed:</strong> {pet.breed}</p>
              <p><strong>Age:</strong> {pet.age}</p>
              <p><strong>Notes:</strong> {pet.notes}</p>
              <hr />
            </div>
          ))}
        </>
      )}

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

export default OwnerDashboardPage;



