// src/pages/sitter/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import { getMySitterProfile } from "../../api/api";
// NOTE: utils is under owner/dashboard in your structure
import { getSitterImage, getPetImage } from "../owner/dashboard/utils";
import pawIcon from "../../assets/images/paw.png";
console.log("paw icon path:", pawIcon);

const Profile = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch sitter profile + services
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMySitterProfile();

        // Normalize image URLs (serializer may return field name or *_url)
        const pic =
          data?.profile_picture_url ??
          data?.profile_picture ??
          "";
        const banner =
          data?.banner_picture_url ??
          data?.banner_picture ??
          "";

        // Build absolute/relative-safe URLs
        const normalizeUrl = (u) => {
          if (!u) return "";
          if (typeof u !== "string") return "";
          return u.startsWith("http") ? u : `http://127.0.0.1:8000${u}`;
        };

        // Normalize sitter core fields
        const normalized = {
          name:
            data?.display_name ||
            [data?.user?.first_name, data?.user?.last_name].filter(Boolean).join(" ") ||
            data?.user?.username ||
            "",
          email: data?.user?.email || data?.email || "",
          phone: data?.user?.phone || data?.contact_phone || "",
          bio: data?.bio || "",
          profile_picture_url: normalizeUrl(pic),
          banner_picture_url: normalizeUrl(banner),
        };
        setProfile(normalized);

        // Normalize "services" from tags + specialties (both lists of objects with .name)
        const tagList = Array.isArray(data?.tags) ? data.tags : [];
        const specList = Array.isArray(data?.specialties) ? data.specialties : [];
        const merged = [...tagList, ...specList];

        const servicesNorm = merged.map((item) => {
          // Accept shapes: {name: "Birds"}, "Birds", {label: "Birds"}
          if (typeof item === "string") return { id: item, name: item };
          const nm = item?.name || item?.label || item?.title || item?.type || "Service";
          return { id: item?.id ?? nm, name: nm };
        });
        setServices(servicesNorm);

        // Build services from tags + specialties (Both are arrays of { id, name, slug })
        const tags        = Array.isArray(data?.tags) ? data.tags : [];
        const specialties = Array.isArray(data?.specialties) ? data.specialties : [];
        const svc = [
          ...tags.map(t => ({ id: t.id ?? t.name, name: t.name })),
          ...specialties.map(s => ({ id: s.id ?? s.slug ?? s.name, name: s.name ?? s.slug })),
        ];
        setServices(svc);
        
      } catch (err) {
        console.error("Error fetching sitter profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getProfilePictureUrl = (pictureUrl) => {
    if (!pictureUrl) return getSitterImage(null, 0);
    if (pictureUrl.startsWith("http")) return pictureUrl;
    return `http://127.0.0.1:8000${pictureUrl}`;
  };

  const getBannerStyle = (bannerUrl) => {
    if (!bannerUrl) return { backgroundColor: "#dbeafe" };
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

  const getServiceThumb = (service) => {
    // Prefer explicit image; otherwise species/pet_type-based fallback
    if (service?.image_url) {
      return service.image_url.startsWith("http")
        ? service.image_url
        : `http://127.0.0.1:8000${service.image_url}`;
    }
    const species = service?.species || service?.pet_type || "default";
    return getPetImage(species);
  };

  if (loading) return <div className="text-center py-10 pt-32 text-gray-600">Loading profile...</div>;
  if (error) return <div className="text-center py-10 pt-32 text-red-500">{error}</div>;
  if (!profile) return <div className="text-center py-10 pt-32 text-gray-600">No profile data found.</div>;

  return (
    <>
      <ResponsiveMenu open={open} />

      {/* --- Banner Section --- */}
      <section className="container flex justify-between items-center pt-24">
        <div className="w-full h-64 md:h-80" style={getBannerStyle(profile.banner_picture_url)} />
      </section>

      {/* --- Profile Info Section --- */}
      <div className="bg-white flex justify-center">
        <div className="w-[85%] md:w-[80%] border-b border-gray-200">
          <div className="container mx-auto px-1 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 md:px-20">
              <div className="flex items-center gap-6 -mt-8 md:-mt-12 w-full md:w-auto justify-between md:justify-start md:mr-auto">
                <img
                  src={profile.profile_picture_url || getSitterImage(null, 0)}
                  onError={(e) => (e.target.src = getSitterImage(null, 0))}
                  alt={profile.name || "Pet Sitter"}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white object-cover bg-gray-100 shadow-lg"
                />
                <div className="mt-2 md:mt-0">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    {profile.name || "Pet Sitter's Name"}
                  </h1>
                  {/* <p className="text-gray-600 mt-1">{profile.email || "email@example.com"}</p> */}
                  {/* <p className="text-gray-500 text-sm mt-0.5">{profile.phone || "phone number"}</p> */}
                  {/* ⭐️ Add rate & rating here */}
                  <p className="text-gray-600 mt-1">{profile.rate_hourly ? `$${profile.rate_hourly}/hr` : "Hourly rate not set"}</p>
                  <p className="text-gray-600 mt-1">⭐ {profile.avg_rating ? profile.avg_rating.toFixed(1) : "No ratings yet"}</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/sitter/edit-profile")}
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
                  {profile.bio || "No bio available yet."}
                </p>
              </div>

              {/* Photos */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-primary">Photos</h3>
                  <button className="text-blue-600 text-md hover:underline">See all photos</button>
                </div>
                <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                  No photos uploaded
                </div>
              </div>
            </div>

            {/* Right Column - My Services */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-xl font-semibold text-primary mb-5">My Services</h3>

              {services.length === 0 ? (
                <p className="text-gray-600 text-sm">No services listed yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {services.map((svc) => (
                    <div
                      key={svc.id || `${svc.name}`}
                      className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-none"
                    >
                      {/* paw icon next to sitter tags & specialties  */}
                      <img src={pawIcon} alt="paw" style={{ width: 30, height: 30 }} />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {svc.name || "Service"}
                        </h4>
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
