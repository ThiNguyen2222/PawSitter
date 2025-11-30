// src/pages/sitter/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import API,{ getMySitterProfile, getTags, getSpecialties, setSitterTaxonomy, getSitterReviews } from "../../api/api";
import defaultProfile from "../../assets/dummy/profile0.png";
import pawIcon from "../../assets/images/paw.png";
console.log("paw icon path:", pawIcon);
import { FaPlus, FaStar } from "react-icons/fa";

const StarRating = ({ rating }) => {
  const max = 5;
  const value = typeof rating === "number" ? rating : 0;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => (
        <FaStar
          key={idx}
          className={
            idx < Math.round(value)
              ? "text-yellow-400"
              : "text-gray-300"
          }
          size={16}
        />
      ))}
      <span className="ml-1 text-sm text-gray-700">
        {value.toFixed(1)}
      </span>
    </div>
  );
};

const getReviewerAvatar = (review) => {
  if (review.owner_profile_picture_url) {
    return review.owner_profile_picture_url.startsWith("http")
      ? review.owner_profile_picture_url
      : `http://127.0.0.1:8000${review.owner_profile_picture_url}`;
  }
  return pawIcon;
};


const Profile = () => {
  const { id } = useParams()
  const navigate = useNavigate();
  const isPublicView = !!id;   // owner viewing a sitter profile
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);

  const [openPicker, setOpenPicker] = useState(false); // State for the picker
  const [options, setOptions] = React.useState([]); // all predefined tags + specialties
  const [selectedIds, setSelectedIds] = React.useState(new Set()); // ids to add

  const handleToggleOption = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveSpecialties = async () => {
    try {
      // Split back into tags vs specialties using the `kind` field
      const chosen = options.filter((opt) => selectedIds.has(opt.id));

      const tagIds = chosen
        .filter((opt) => opt.kind === "tag")
        .map((opt) => opt.rawId);

      const specIds = chosen
        .filter((opt) => opt.kind === "spec")
        .map((opt) => opt.rawId);

      // Call backend to save taxonomy for this sitter
      await setSitterTaxonomy({
        tags: tagIds,
        specialties: specIds,
      });

      // Update UI tags shown in "My Specialties"
      const labels = chosen.map((opt) => opt.name);
      setProfile((prev) => ({ ...prev, tags: labels }));

      setOpenPicker(false);
    } catch (err) {
      console.error("Failed to save specialties", err);
      alert("Sorry, something went wrong saving your specialties.");
    }
  };

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
        const data = id
        ? (await API.get(`profiles/sitters/${id}/`)).data
        : await getMySitterProfile();

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
          if (!u || typeof u !== "string") return "";
          if (typeof u !== "string") return "";
          return u.startsWith("http") ? u : `http://127.0.0.1:8000${u}`;
        };

        // Normalize sitter core fields
        const normalized = {
          id: data?.id,
          name:
            data?.display_name ||
            [data?.user?.first_name, data?.user?.last_name].filter(Boolean).join(" ") ||
            data?.user?.username ||
            "",
          email: data?.user?.email || data?.email || "",

          rate_hourly: data?.rate_hourly ?? null,
          avg_rating:  data?.avg_rating  ?? null,

          phone: data?.user?.phone || data?.contact_phone || "",
          bio: data?.bio || "",
          profile_picture_url: normalizeUrl(pic),
          banner_picture_url: normalizeUrl(banner),
        };
        setProfile(normalized);

        // Load reviews for this sitter
        try {
          if (data?.id) {
            const reviewData = await getSitterReviews(data.id);
            console.log("Review payload →", reviewData);
            setReviews(reviewData);
          }
        } catch (reviewErr) {
          console.error("Error fetching sitter reviews:", reviewErr);
        }

        // Prefer pre-flattened names from serializer; fall back to objects
        const tagsRaw  = Array.isArray(data?.tag_names) ? data.tag_names
              : Array.isArray(data?.tags) ? data.tags : [];
        const specsRaw = Array.isArray(data?.specialty_slugs) ? data.specialty_slugs
              : Array.isArray(data?.specialties) ? data.specialties : [];
        // Convert to strings, dedupe, and keep it tidy
        const toName = (x) => typeof x === "string" ? x : (x?.name ?? x?.slug ?? x?.label ?? "Tag");
        const tagStrings = [...new Set([...tagsRaw, ...specsRaw].map(toName))];
        setProfile(prev => ({ ...prev, tags: tagStrings }));


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
        
        console.log("Sitter profile payload →", data);
        console.log("Normalized profile →", normalized);
      } catch (err) {
        console.error("Error fetching sitter profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // Add the new useEffect for loading predefined tags & specialties
  useEffect(() => {
    if (!openPicker) return;

    (async () => {
      try {
        const [tags, specs] = await Promise.all([
          getTags(),        // ✅ our existing helper
          getSpecialties(), // ✅ our existing helper
        ]);

        const normalized = [
          ...tags.map(t => ({ id: `tag:${t.id}`, rawId: t.id, kind: "tag", name: t.name })),
          ...specs.map(s => ({
            id: `spec:${s.id}`,
            rawId: s.id,
            kind: "spec",
            name: s.name ?? s.slug,
          })),
        ];

        setOptions(normalized);

        // preselect current sitter tags
        const current = new Set(
          (profile.tags ?? [])
            .map(label => normalized.find(o => o.name === label)?.id)
            .filter(Boolean)
        );
        setSelectedIds(current);
      } catch (e) {
        console.error("Failed to load tag/spec options", e);
      }
    })();
  }, [openPicker]);

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
                  src={profile.profile_picture_url || defaultProfile}
                  onError={(e) => (e.target.src = defaultProfile)}
                  alt={profile.name || "Pet Sitter"}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white object-cover bg-gray-100 shadow-lg"
                />
                <div className="mt-2 md:mt-0">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    {profile.name || "Pet Sitter's Name"}
                  </h1>
                  {/* ⭐️ Add rate & rating here */}
                  <p className="text-gray-600 mt-1">{profile.rate_hourly ? `$${profile.rate_hourly}/night` : "Hourly rate not set"}</p>
                  <p className="text-gray-600 mt-1">⭐ {profile.avg_rating ? profile.avg_rating.toFixed(1) : "No ratings yet"}</p>
                </div>
              </div>

              {!isPublicView && (
                <button
                  onClick={() => navigate("/sitter/edit-profile")}
                  className="w-full md:w-auto md:-mt-12 md:mr-10 bg-secondary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-secondary/80 transition flex items-center justify-center gap-2"
                >
                  Edit profile
                </button>
              )}
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

              {/* Tags / Specialties Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
              {/* Header row: title + +Add button */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-primary">Specialties</h3>
                {!isPublicView && (
                  <button
                    onClick={() => setOpenPicker(true)}
                    className="inline-flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-secondary/80 transition"
                  >
                    <FaPlus className="text-xs" />
                    Add
                  </button>
                )}
              </div>

              {/* Tags display */}
              {!profile.tags?.length ? (
                <p className="text-gray-500 text-sm">No specialties listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.slice(0, 12).map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-secondary/20 text-secondary text-sm font-semibold px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Right Column - Reviews & Ratings */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-xl font-semibold text-primary mb-5">
                Reviews & Ratings
              </h3>

              {!reviews || reviews.length === 0 ? (
                <p className="text-gray-600 text-sm">No reviews yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-none"
                    >
                      {/* paw icon next to review change to owner profile image */}
                      <img src={getReviewerAvatar(review)} alt={review.owner_name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="mb-1">
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div> {/* END of Right Column - Reviews & Ratings */}

          </div>
        </div>
      </section>

      {/* === Specialties Modal === */}
      {openPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="text-lg font-semibold text-primary">Choose your specialties</h3>
              <button
                onClick={() => setOpenPicker(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Options list */}
            <div className="px-5 py-4 space-y-2 overflow-y-auto">
              {options.length === 0 ? (
                <p className="text-sm text-gray-500">Loading options…</p>
              ) : (
                options.map((opt) => {
                  const isSelected = selectedIds.has(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleOption(opt.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm
                        ${isSelected ? "bg-secondary/10 border-secondary" : "bg-white border-gray-200"}`}
                    >
                      <span>{opt.name}</span>
                      {isSelected && <span className="text-xs font-semibold text-secondary">Selected</span>}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 px-5 py-3 border-t">
              <button
                onClick={() => setOpenPicker(false)}
                className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSpecialties}
                className="px-4 py-1.5 text-sm rounded-lg bg-secondary text-white font-semibold hover:bg-secondary/80"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
      
    </>
  );
};

export default Profile;
