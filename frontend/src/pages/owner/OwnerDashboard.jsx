import React, { useEffect, useState } from "react";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import HeroSection from "../../components/HeroSection";
import { useNavigate } from "react-router-dom";
import { getSitters } from "../../api/api";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [sitters, setSitters] = useState([]);
  const navigate = useNavigate();

  // Handle menu toggle on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch sitters from API
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

  return (
    <>
      <ResponsiveMenu open={open} />

      <HeroSection
        title="Welcome Back, Paw Parent!"
        subtitle="Manage your bookings, messages, and sitter requests all in one place."
        buttonText="Get Started"
        onButtonClick={() => navigate("/booking")}
      />

      <section className="px-6 py-12">
        <h2 className="text-3xl text-primary font-semibold mb-8">
          Meet Our Trusted Pet Sitters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sitters.map((sitter) => (
            <div
              key={sitter.id}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start hover:shadow-xl transition"
            >
              {/* Top section with image and name */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={sitter.image || "https://via.placeholder.com/80"}
                  alt={sitter.display_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {sitter.display_name}
                    {sitter.verification_status === "VERIFIED" && (
                      <span className="text-green-500" title="Verified">✔️</span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm">{sitter.home_zip}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500 font-medium">
                  {"⭐".repeat(Math.round(sitter.avg_rating || 0))}
                </span>
                <span className="text-gray-500 text-sm">
                  ({sitter.reviews_count || 0})
                </span>
              </div>

              {/* Bio snippet */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                "{sitter.bio || "No bio available."}"
              </p>

              {/* Price and Contact button */}
              <div className="flex items-center justify-between w-full mt-auto">
                <span className="text-gray-800 font-semibold">
                  from ${sitter.rate_hourly}/hr
                </span>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
