import React, { useEffect, useState } from "react";
import { getSitters } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { getSitterImage } from "./utils";

const SittersSection = () => {
  const [sitters, setSitters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const navigate = useNavigate();

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

  const getSitterImageUrl = (sitter, index) => {
    // If profile_picture_url exists and is a full URL, use it
    if (sitter.profile_picture_url) {
      if (sitter.profile_picture_url.startsWith("http")) {
        return sitter.profile_picture_url;
      }
      // If it's a relative path from backend, prepend domain
      return `http://127.0.0.1:8000${sitter.profile_picture_url}`;
    }
    // Otherwise use local fallback based on gender
    return getSitterImage(sitter.gender, index);
  };

  return (
    <section className="container flex justify-between items-center py-8">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl text-primary font-semibold mb-8 text-center">
          Meet Our Trusted Pet Sitters
        </h2>

        {sitters.length === 0 ? (
          <p className="text-gray-600 text-center">No sitters available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitters.slice(0, visibleCount).map((sitter, index) => (
              <div
                key={sitter.id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-shadow duration-300 hover:shadow-xl"
              >
                <img
                  src={getSitterImageUrl(sitter, index)}
                  onError={(e) => (e.target.src = getSitterImage(null, 0))}
                  alt={sitter.display_name || "Pet sitter"}
                  className="w-24 h-24 rounded-full object-cover border-2 border-secondary mb-4"
                />

                <h3 className="text-xl font-semibold text-gray-800">
                  {sitter.display_name || "Unknown Sitter"}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Westminster, CA {sitter.home_zip || ""}
                </p>

                <div className="flex justify-center items-center gap-1 mb-3">
                  <span className="text-yellow-500 font-medium text-lg">
                    {"★".repeat(Math.round(sitter.avg_rating || 0))}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    {sitter.avg_rating?.toFixed(1) || "N/A"}
                  </span>
                </div>

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

                <p className="text-primary font-semibold mb-2">
                  from ${sitter.rate_hourly || "?"}/night
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
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className="mt-6 bg-secondary text-white px-6 py-3 rounded-lg shadow-md hover:bg-secondary/80 transition font-bold"
            >
              View More Caregivers
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SittersSection;