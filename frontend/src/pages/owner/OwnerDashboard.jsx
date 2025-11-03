import React, { useEffect, useState } from "react";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import HeroSection from "../../components/HeroSection";
import { useNavigate } from "react-router-dom";
import { getSitters } from "../../api/api";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [sitters, setSitters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); // show 5 sitters initially
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

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

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
        <h2 className="text-3xl text-primary font-semibold mb-8 text-center">
          Meet Our Trusted Pet Sitters
        </h2>

        <div className="space-y-8 max-w-4xl mx-auto">
          {sitters.length === 0 ? (
            <p className="text-gray-600 text-center">No sitters available yet.</p>
          ) : (
            sitters.slice(0, visibleCount).map((sitter) => (
              <div
                key={sitter.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-xl transition"
              >
                {/* Profile Info */}
                <div className="flex items-center gap-6">
                  <img
                    src={
                      sitter.profile_picture_url || "https://via.placeholder.com/80"
                    }
                    alt={sitter.display_name}
                    className="w-24 h-24 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {sitter.display_name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Westminster, CA {sitter.home_zip}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 font-medium text-lg">
                        {"★".repeat(Math.round(sitter.avg_rating || 0))}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        {sitter.avg_rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {sitter.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-secondary/20 text-secondary text-xs font-semibold px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rate + Contact Button */}
                <div className="mt-6 sm:mt-0 sm:text-right">
                  <p className="text-primary font-semibold mb-3">
                    from ${sitter.rate_hourly}/night
                  </p>
                  <button
                    onClick={() => navigate(`/sitter/${sitter.id}`)}
                    className="bg-secondary text-white px-5 py-2 rounded-full hover:bg-secondary/80 transition"
                  >
                    Contact
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View More Caregivers Button */}
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
      </section>
    </>
  );
};

export default Dashboard;
