// scr/pages/owner/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import { getMyOwnerProfile } from "../../api/api";

const Profile = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Handle responsive menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch profile + pets
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyOwnerProfile();
        setProfile(data);
        setPets(Array.isArray(data.pets) ? data.pets : []);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helper to get profile picture URL
  const getProfilePictureUrl = (pictureUrl) => {
    if (!pictureUrl) {
      return getSitterImage(null, 0); // Use local fallback
    }
    if (pictureUrl.startsWith("http")) {
      return pictureUrl;
    }
    return `http://127.0.0.1:8000${pictureUrl}`;
  };

  // Helper to get banner picture URL or background color
  const getBannerStyle = (bannerUrl) => {
    if (!bannerUrl) {
      return { backgroundColor: "#dbeafe" }; // Light blue default
    }
    if (bannerUrl.startsWith("http")) {
      return {
        backgroundImage: `url(${bannerUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      backgroundImage: `url(http://127.0.0.1:8000${bannerUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  // Helper to get pet image URL
  const getPetImageUrl = (pet) => {
    if (pet.profile_picture_url) {
      if (pet.profile_picture_url.startsWith("http")) {
        return pet.profile_picture_url;
      }
      return `http://127.0.0.1:8000${pet.profile_picture_url}`;
    }
    return getPetImage(pet.species); // Use local fallback
  };

  if (loading)
    return <div className="text-center py-10 pt-32 text-gray-600">Loading profile...</div>;
  if (error)
    return <div className="text-center py-10 pt-32 text-red-500">{error}</div>;
  if (!profile)
    return <div className="text-center py-10 pt-32 text-gray-600">No profile data found.</div>;

  return (
    <>
      <ResponsiveMenu open={open} />

      {/* --- Banner Section --- */}
      <section className="container flex justify-between items-center pt-24">
        <div
          className="w-full h-64 md:h-80"
          style={getBannerStyle(profile.banner_picture_url)}
        ></div>
      </section>

       {/* --- Profile Info Section --- */}
      <div className="bg-white flex justify-center">
        <div className="w-[85%] md:w-[80%] border-b border-gray-200">
        <div className="container mx-auto px-1 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 md:px-20">
            <div className="flex items-center gap-6 -mt-8 md:-mt-12 w-full md:w-auto justify-between md:justify-start md:mr-auto">
              <img
                src={getProfilePictureUrl(profile.profile_picture_url)}
                onError={(e) => (e.target.src = getSitterImage(null, 0))}
                alt={profile.name || "Pet Owner"}
                className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white object-cover bg-gray-100 shadow-lg"
              />

              <div className="mt-2 md:mt-0">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {profile.name || "Pet Owner's Name"}
                </h1>
                <p className="text-gray-600 mt-1">{profile.email || "email@example.com"}</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {profile.phone || "phone number"}
                </p>
              </div>
            </div>

            <button 
              onClick={() => navigate("/owner/edit-profile")}
              className="w-full md:w-auto md:-mt-12 md:mr-10 bg-secondary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-secondary/80 transition flex items-center justify-center gap-2"
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* --- Profile Body Section --- */}
      <section className="container flex justify-between items-center py-8">
        <div className="container mx-auto px-1 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Bio */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-xl font-semibold text-primary mb-3">Bio</h3>
                <p className="text-gray-700 text-lg">
                  {profile.notes || "No bio available yet."}
                </p>
              </div>
            </div>

            {/* Right Column - Vertical My Pets */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-xl font-semibold text-primary mb-5">My Pets</h3>

              {pets.length === 0 ? (
                <p className="text-gray-600 text-sm">No pets found for this owner.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-none"
                    >
                      <img
                        src={getPetImageUrl(pet)}
                        onError={(e) => (e.target.src = getPetImage("default"))}
                        alt={pet.name}
                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {pet.name}
                        </h4>
                        <p className="text-gray-600 text-base capitalize">
                          {pet.species} — {pet.breed}
                        </p>
                        <p className="text-gray-700 text-base mt-1">
                          {pet.notes || "Loves walks and treats"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;