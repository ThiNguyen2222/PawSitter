import React, { useEffect, useState } from "react";
import API from "../../../api/api";
import { getPetImage } from "./utils";

const PetsSection = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPets() {
      try {
        setLoading(true);
        const ownerProfile = await API.get("profiles/owners/me/");
        setPets(Array.isArray(ownerProfile.data.pets) ? ownerProfile.data.pets : []);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, []);

  const getPetImageUrl = (pet) => {
    // If profile_picture_url exists and is a full URL, use it
    if (pet.profile_picture_url) {
      if (pet.profile_picture_url.startsWith("http")) {
        return pet.profile_picture_url;
      }
      // If it's a relative path from backend, prepend domain
      return `http://127.0.0.1:8000${pet.profile_picture_url}`;
    }
    // Otherwise use local fallback based on species
    return getPetImage(pet.species);
  };

  return (
    <section className="container flex justify-between items-center py-8">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl text-primary font-semibold mb-8">My Pets</h2>

        {loading ? (
          <p className="text-gray-600 text-center">Loading your pets...</p>
        ) : pets.length === 0 ? (
          <p className="text-gray-600 text-center">No pets found for this owner.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl"
              >
                <img
                  src={getPetImageUrl(pet)}
                  onError={(e) => (e.target.src = getPetImage("default"))}
                  alt={pet.name || "Pet"}
                  className="w-full h-52 object-cover"
                />

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <span role="img" aria-label="pet">🐾</span>
                    {pet.name || "Unnamed Pet"}
                  </h3>

                  <span className="inline-block bg-green-100 text-green-700 text-sm px-3 py-1 mt-2 rounded-full">
                    😊 Happy
                  </span>

                  <div className="mt-4 space-y-1 text-gray-700 text-sm">
                    <p>❤️ {pet.notes || "Loves belly rubs and walks"}</p>
                    <p>🐾 {pet.species || "Unknown species"} – {pet.breed || "Unknown breed"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PetsSection;
