import React, { useEffect, useState } from "react";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import HeroSection from "../../components/HeroSection";
import { useNavigate } from "react-router-dom";
import { getSitters, getOwnerPets } from "../../api/api";
import API from "../../api/api";

// import profile1 from "../../assets/dummy/profile1.jpg";
// import profile2 from "../../assets/dummy/profile2.jpg";
// import profile3 from "../../assets/dummy/profile3.jpg";
// import profile4 from "../../assets/dummy/profile4.jpg";
// import profile5 from "../../assets/dummy/profile5.jpg";
// import profile6 from "../../assets/dummy/profile6.jpg";

// const sitterImages = [profile1, profile2, profile3, profile4, profile5, profile6];

// Helper for Unsplash images
const getPetImage = (species) => {
  switch (species?.toLowerCase()) {
    case "dog":
      return "https://images.unsplash.com/photo-1601758123927-1969c9d69b1f?auto=format&fit=crop&w=800&q=80";
    case "cat":
      return "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80";
    case "bird":
      return "https://images.unsplash.com/photo-1603775020644-5cce3f0b8b3a?auto=format&fit=crop&w=800&q=80";
    case "rabbit":
      return "https://images.unsplash.com/photo-1595433562696-a8b7d92a98d7?auto=format&fit=crop&w=800&q=80";
    case "lizard":
      return "https://images.unsplash.com/photo-1570032257809-d573e18c4a0d?auto=format&fit=crop&w=800&q=80";
    case "fish":
      return "https://images.unsplash.com/photo-1565895405127-38a9b67c8b5d?auto=format&fit=crop&w=800&q=80";
    default:
      return "https://source.unsplash.com/800x600/?pet";
  }
};

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [sitters, setSitters] = useState([]);
  const [pets, setPets] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Handle responsive menu close
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch owner pets
  useEffect(() => {
    async function fetchPets() {
      try {
        setLoading(true);
        const userString = localStorage.getItem("user");
        if (!userString) {
          console.warn("No user found in localStorage.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userString);
        if (!user || !user.id) {
          console.warn("Invalid user data.");
          setLoading(false);
          return;
        }

        console.log("Current user ID:", user.id);

        // Fetch ALL owner profiles and find the one that matches the current user
        const allOwnersResponse = await API.get("profiles/owners/");
        const myOwnerProfile = allOwnersResponse.data.find(
          (owner) => owner.user_id === user.id
        );

        if (!myOwnerProfile || !myOwnerProfile.id) {
          console.warn("No owner profile found for this user");
          setPets([]);
          setLoading(false);
          return;
        }

        const petsData = await getOwnerPets(myOwnerProfile.id);
        setPets(Array.isArray(petsData) ? petsData : []);
      } catch (error) {
        console.error("=== ERROR FETCHING PETS ===", error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, []);

  // Fetch sitters
  useEffect(() => {
    async function fetchSitters() {
      try {
        const data = await getSitters();
        setSitters(data);
      } catch (error) {
        console.error("Error fetching sitters:", error);
      }
    }
    fetchSitters();
  }, []);

  const handleViewMore = () => setVisibleCount((prev) => prev + 5);

  return (
    <>
      <ResponsiveMenu open={open} />

      {/* 🦴 Hero Section */}
      <HeroSection
        title="Welcome Back, Paw Parent!"
        subtitle="Manage your bookings, messages, and sitter requests all in one place."
        buttonText="Get Started"
        onButtonClick={() => navigate("/booking")}
      />

      {/* My Pets Section */}
      <section className="container flex justify-between items-center py-8">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl text-primary font-semibold mb-8">
            My Pets
          </h2>

          {loading ? (
            <p className="text-gray-600 text-center">Loading your pets...</p>
          ) : pets.length === 0 ? (
            <p className="text-gray-600 text-center">
              No pets found for this owner.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                >
                  <img
                    src={
                      pet.photo_url
                        ? pet.photo_url.startsWith("http")
                          ? pet.photo_url
                          : `http://127.0.0.1:8000${pet.photo_url}`
                        : getPetImage(pet.species)
                    }
                    alt={pet.name}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <span role="img" aria-label="pet">
                        🐾
                      </span>
                      {pet.name}
                    </h3>

                    <span className="inline-block bg-green-100 text-green-700 text-sm px-3 py-1 mt-2 rounded-full">
                      😊 Happy
                    </span>

                    <div className="mt-4 space-y-1 text-gray-700 text-sm">
                      <p>❤️ {pet.notes || "Loves belly rubs and walks"}</p>
                      <p>🐾 {pet.species} – {pet.breed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Meet Our Trusted Pet Sitters */}
      <section className="container flex justify-between items-center py-8">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl text-primary font-semibold mb-8 text-center">
            Meet Our Trusted Pet Sitters
          </h2>

          {sitters.length === 0 ? (
            <p className="text-gray-600 text-center">No sitters available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sitters.slice(0, visibleCount).map((sitter) => (
                <div
                  key={sitter.id}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-shadow duration-300 hover:shadow-xl"
                >
                  {/* Circular profile image */}
                  <img
                    src={
                      sitter.profile_picture_url ||
                      "https://images.unsplash.com/photo-1603415526960-f7e0328d8e3b?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={sitter.display_name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-secondary mb-4"
                  />

                  {/* Sitter Info */}
                  <h3 className="text-xl font-semibold text-gray-800">
                    {sitter.display_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Westminster, CA {sitter.home_zip}
                  </p>

                  {/* Rating */}
                  <div className="flex justify-center items-center gap-1 mb-3">
                    <span className="text-yellow-500 font-medium text-lg">
                      {"★".repeat(Math.round(sitter.avg_rating || 0))}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      {sitter.avg_rating?.toFixed(1) || "N/A"}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {sitter.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-secondary/20 text-secondary text-xs font-semibold px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Rate & Contact Button */}
                  <p className="text-primary font-semibold mb-2">
                    from ${sitter.rate_hourly}/night
                  </p>
                  <button
                    onClick={() => navigate(`/sitter/${sitter.id}`)}
                    className="bg-secondary text-white px-5 py-2 rounded-full hover:bg-secondary/80 transition"
                  >
                    Contact
                  </button>
                </div>
              ))}
            </div>
          )}

          {visibleCount < sitters.length && (
            <div className="text-center mt-10">
              <button
                onClick={handleViewMore}
                className="mt-6 bg-secondary text-white px-6 py-3 rounded-lg shadow-md hover:bg-secondary/80 transition font-bold"
              >
                View More Caregivers
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
