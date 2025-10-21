import React, { useEffect, useState } from 'react';

const SitterProfile = ({ sitterId }) => {
  const [sitter, setSitter] = useState({});

  useEffect(() => {
    if (!sitterId) return;

    // Fetch sitter profile
    fetch(`http://localhost:3000/api/sitters/${sitterId}/`)
      .then(res => res.json())
      .then(data => setSitter(data))
      .catch(err => console.error('Error fetching sitter data:', err));
  }, [sitterId]);

  return (
    <div>
      <h1>Sitter Profile</h1>

      <h2>Profile</h2>
      <p><strong>User:</strong> {sitter.user}</p>
      <p><strong>Display Name:</strong> {sitter.display_name}</p>
      <p><strong>Bio:</strong> {sitter.bio}</p>
      <p><strong>Rate (Hourly):</strong> {sitter.rate_hourly}</p>
      <p><strong>Service Radius (km):</strong> {sitter.service_radius_km}</p>
      <p><strong>Home Zipcode:</strong> {sitter.home_zip}</p>
      <p><strong>Average Rating:</strong> {sitter.avg_rating}</p>
      <p><strong>Verification Status:</strong> {sitter.verification_status}</p>

      {sitter.tags && sitter.tags.length > 0 && (
        <>
          <h3>Tags</h3>
          <ul>
            {sitter.tags.map((tag, index) => (
              <li key={index}>{tag}</li>
            ))}
          </ul>
        </>
      )}

      {sitter.specialties && sitter.specialties.length > 0 && (
        <>
          <h3>Specialties</h3>
          <ul>
            {sitter.specialties.map((specialty, index) => (
              <li key={index}>{specialty}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SitterDashboard;


