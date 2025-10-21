import React, { useEffect, useState } from "react";
import axios from "axios";

const OwnerProfile = ({ ownerId }) => {
  const [ownerProfile, setOwnerProfile] = useState({});
  const [pets, setPets] = useState([]);

  useEffect(() => {
    if (!ownerId) return;

    // Fetch owner profile
    axios.get(`http://localhost:3000/api/owners/${ownerId}/`)
      .then(res => setOwnerProfile(res.data))
      .catch(err => console.error("Error fetching owner profile:", err));

    // Fetch owner's pets
    axios.get(`http://localhost:3000/api/owners/${ownerId}/pets/`)
      .then(res => setPets(res.data))
      .catch(err => console.error("Error fetching pets:", err));
  }, [ownerId]);

  return (
    <div>
      <h2>Owner Profile</h2>
      <p><strong>User:</strong> {ownerProfile.user}</p>
      <p><strong>Name:</strong> {ownerProfile.name}</p>
      <p><strong>Phone:</strong> {ownerProfile.phone}</p>
      <p><strong>Location:</strong> {ownerProfile.default_location}</p>
      <p><strong>Notes:</strong> {ownerProfile.notes}</p>

      {pets.length > 0 ? (
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
      ) : (
        <p>No pets listed.</p>
      )}
    </div>
  );
};

export default OwnerProfile;
