// src/pages/sitter/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import { getMySitterProfile } from "../../api/api";
// import { getSitterImage} from "../owner/dashboard/utils";

const EditProfile = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sitterID, setSitterId] = useState(null);
  const [activeTab, setActiveTab] = useState("account");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [bannerPicture, setBannerPicture] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch sitter profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await getMySitterProfile();
        setSitterId(data.id);

        setFormData({
          name: data.name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          experience: data.experience || "",
          bio: data.bio || "",
        });

        const picUrl = data.profile_picture_url
          ? data.profile_picture_url.startsWith("http")
            ? data.profile_picture_url
            : `http://127.0.0.1:8000${data.profile_picture_url}`
          : getSitterImage(null, 0);
        setProfilePicturePreview(picUrl);

        if (data.banner_picture_url) {
          setBannerPreview(
            data.banner_picture_url.startsWith("http")
              ? data.banner_picture_url
              : `http://127.0.0.1:8000${data.banner_picture_url}`
          );
        }
      } catch (err) {
        console.error("Error fetching sitter profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(getSitterImage(null, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("experience", formData.experience);
      if (profilePicture) formDataToSend.append("profile_picture", profilePicture);
      if (bannerPicture) formDataToSend.append("banner_picture", bannerPicture);

      const response = await fetch(
        `http://127.0.0.1:8000/api/profiles/sitters/${sitterID}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => navigate("/sitter/profile"), 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center py-10 text-gray-600">Loading profile...</div>;

  return (
    <>
      <ResponsiveMenu open={open} />

      {/* Banner Section */}
      <section className="pt-24">
        <div
          className="w-full h-64 md:h-80"
          style={
            bannerPreview
              ? {
                  backgroundImage: `url(${bannerPreview})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { backgroundColor: "#dbeafe" }
          }
        ></div>
      </section>

      {/* Profile Header */}
      <div className="bg-white flex justify-center">
        <div className="w-[85%] md:w-[80%] border-b border-gray-200">
          <div className="container mx-auto px-1 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 md:px-20">
              <div className="flex items-center gap-6 -mt-8 md:-mt-12 w-full md:w-auto justify-between md:justify-start md:mr-auto">
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white object-cover bg-gray-100 shadow-lg"
                />
                <div className="mt-2 md:mt-0">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    {formData.name || "Sitter Name"}
                  </h1>
                  <p className="text-gray-600 mt-1">{formData.email || "email@example.com"}</p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {formData.phone || "Phone number"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("account")}
                className="w-full md:w-auto md:-mt-12 md:mr-10 bg-secondary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-secondary/80 transition flex items-center justify-center gap-2"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-primary mb-6">Account Settings</h2>
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      activeTab === "account"
                        ? "bg-primary text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      activeTab === "security"
                        ? "bg-primary text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Login & Security
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {activeTab === "account" && (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8"
                >
                  {/* Upload Fields */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h2>
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                      />
                      <div className="flex gap-3 flex-wrap">
                        <label
                          htmlFor="profile_picture"
                          className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 cursor-pointer"
                        >
                          Upload New
                          <input
                            id="profile_picture"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveProfilePicture}
                          className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Banner upload */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Banner Picture</h2>
                    <label
                      htmlFor="banner_picture"
                      className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 cursor-pointer"
                    >
                      Upload Banner
                      <input
                        id="banner_picture"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerPictureChange}
                        className="hidden"
                      />
                    </label>
                    {bannerPicture && (
                      <p className="mt-2 text-sm text-green-600">Selected: {bannerPicture.name}</p>
                    )}
                  </div>

                  {/* User Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                        <span className="ml-2 text-xs text-green-600 font-semibold">✓ Verified</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (years)
                      </label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition ${
                        saving ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {saving ? "Updating Profile..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-primary mb-6">Login & Security</h2>
                  <p className="text-gray-600 mb-6">Manage your password and security settings</p>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Change Password</h3>
                      <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90">
                        Change Password
                      </button>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Two-Factor Authentication</h3>
                      <button className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;


