import React, { useEffect, useState } from "react";
import { getOwnerProfile } from "../../api/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await getOwnerProfile(user.id);
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center py-10 text-gray-600">No profile data found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Banner */}
      {profile.banner_picture_url && (
        <img
          src={profile.banner_picture_url}
          alt="Banner"
          className="w-full h-48 object-cover rounded-xl shadow-sm mb-6"
        />
      )}

      {/* Profile Info */}
      <div className="flex items-center gap-6 mb-6">
        <img
          src={profile.profile_picture_url}
          alt={profile.name}
          className="w-24 h-24 object-cover rounded-full border-4 border-secondary"
        />
        <div>
          <h1 className="text-2xl font-bold text-primary">{profile.name}</h1>
          <p className="text-gray-600">{profile.email}</p>
          <p className="text-gray-500 text-sm">{profile.phone || "No phone number added"}</p>
        </div>
      </div>

      {/* Other Info */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
        <h2 className="text-xl font-semibold text-primary mb-4">Profile Details</h2>
        <p>
          <strong>Location:</strong> {profile.default_location || "Not set"}
        </p>
        <p>
          <strong>Notes:</strong> {profile.notes || "No additional notes"}
        </p>
      </div>
    </div>
  );
};

export default Profile;
