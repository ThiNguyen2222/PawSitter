import React, { useEffect, useState } from 'react';

const OwnerDashboard = ({ ownerId }) => {
  const [ownerProfile, setOwnerProfile] = useState({});
  const [pets, setPets] = useState([]);

  useEffect(() => {
    if (!ownerId) return;

    // Fetch owner profile data
    fetch(`http://localhost:3000/api/owners/${ownerId}/`)
      .then(res => res.json())
      .then(data => setOwnerProfile(data))
      .catch(err => console.error('Error fetching owner profile: ', err));

    // Fetch owner's pets
    fetch(`http://localhost:3000/api/owners/${ownerId}/pets/`)
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(err => console.error('Error fetching pets: ', err));
  }, [ownerId]);

  return (
    <div>
      <h2>Owner Profile</h2>
      {owners.map((owner) => (
        <div key={owner.id} style={{ marginBottom: "1rem" }}>
          <h3>Owner Profile</h3>
          <p><strong>User:</strong> {owner.user}</p>
          <p><strong>Name:</strong> {owner.name}</p>
          <p><strong>Phone:</strong> {owner.phone}</p>
          <p><strong>Location:</strong> {owner.default_location}</p>
          <p><strong>Notes:</strong> {owner.notes}</p>

          {owner.pets && owner.pets.length > 0 ? (
            <>
              <h4>Pets</h4>
              {owner.pets.map((pet) => (
                <div key={pet.id} style={{ marginLeft: "1rem" }}>
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
      ))}
    </div>
  );
};

export default OwnerDashboard;

