// src/pages/sitter/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import PasswordChangeModal from '../owner/PasswordModal';
import { getMySitterProfile, updateSitterProfile } from "../../api/api";
import defaultProfileImg from "../../assets/dummy/profile0.png";

const EditProfile = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [sitterId, setSitterId] = useState(null);
  const [activeTab, setActiveTab] = useState("account");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    phone: "",
    bio: "",
    rate_hourly: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(defaultProfileImg);
  const [bannerPicture, setBannerPicture] = useState(null);

  // Handle responsive menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }

        setUserId(user.id);
        const data = await getMySitterProfile();
        setSitterId(data.id);
        
        setFormData({
          display_name: data.display_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          rate_hourly: data.rate_hourly || "",
        });

        // Set profile picture preview
        if (data.profile_picture_url) {
          const picUrl = data.profile_picture_url.startsWith("http")
            ? data.profile_picture_url
            : `http://127.0.0.1:8000${data.profile_picture_url}`;
          setProfilePicturePreview(picUrl);
        } else {
          setProfilePicturePreview(defaultProfileImg);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile picture must be less than 5MB");
        setTimeout(() => setError(""), 3000);
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.onerror = () => {
        setError("Failed to read image file");
        setTimeout(() => setError(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner picture selection
  const handleBannerPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Banner picture must be less than 5MB");
        setTimeout(() => setError(""), 3000);
        return;
      }
      setBannerPicture(file);
    }
  };

  // Remove profile picture
  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(defaultProfileImg);
  };

  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    // Validate required fields
    if (!formData.display_name.trim()) {
      setError("Name is required");
      setSaving(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      setSaving(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Validate hourly rate
    if (formData.rate_hourly && parseFloat(formData.rate_hourly) < 0) {
      setError("Hourly rate must be a positive number");
      setSaving(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("display_name", formData.display_name.trim());
      formDataToSend.append("phone", formData.phone.trim());
      formDataToSend.append("bio", formData.bio.trim());
      
      if (formData.rate_hourly) {
        formDataToSend.append("rate_hourly", formData.rate_hourly);
      }

      if (profilePicture) {
        formDataToSend.append("profile_picture", profilePicture);
      }

      if (bannerPicture) {
        formDataToSend.append("banner_picture", bannerPicture);
      }

      // Log what we're sending
      console.log("Sending data:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await fetch(`http://127.0.0.1:8000/api/profiles/sitters/${sitterId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const responseData = await response.json();
      console.log("Response from backend:", responseData);
      
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10 text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <>
      <ResponsiveMenu open={open} />

        <div className="min-h-screen bg-gradient-to-br from-[#f0e6e4] to-white pt-24 pb-12">        
          <div className="container mx-auto px-6">
          {/* Back Button */}
          <div className="w-[90%] mx-auto">
          <button
            onClick={() => navigate("/sitter/profile")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </button>
          </div>

            <div className="flex flex-col lg:flex-row gap-5 w-[90%] mx-auto">
            {/* Left Sidebar */}
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
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Account Settings Tab */}
              {activeTab === "account" && (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 md:p-8">
                    {/* Profile Picture Section */}
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Profile Picture</h2>
                      <div className="flex items-center gap-4">
                        <img
                          src={profilePicturePreview}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                        />
                        <div className="flex flex-wrap gap-3">
                          <label className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition cursor-pointer">
                            Upload New
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveProfilePicture}
                            className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition"
                          >
                            Remove Profile Picture
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Banner Picture Section */}
                    <div className="mb-8 pb-8 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Banner Picture</h2>
                      <label className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition cursor-pointer inline-block">
                        Upload Banner
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerPictureChange}
                          className="hidden"
                        />
                      </label>
                      {bannerPicture && (
                        <p className="mt-2 text-sm text-green-600">New banner selected: {bannerPicture.name}</p>
                      )}
                    </div>

                    {/* Account Settings Title */}
                    <h2 className="text-xl font-semibold text-primary mb-6">Account Settings</h2>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full name *
                        </label>
                        <input
                          type="text"
                          id="display_name"
                          name="display_name"
                          value={formData.display_name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Email */}
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

                      {/* Username - Disabled (derived from email) */}
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={formData.email.split("@")[0] || ""}
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone number *
                          <span className="ml-2 text-xs text-green-600 font-semibold">✓ Verified</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+1 945-913-2196"
                        />
                      </div>

                      {/* Hourly Rate */}
                      <div>
                        <label htmlFor="rate_hourly" className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate ($/hour)
                        </label>
                        <input
                          type="number"
                          id="rate_hourly"
                          name="rate_hourly"
                          value={formData.rate_hourly}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="e.g., 25.00"
                        />
                      </div>
                    </div>

                    {/* Bio */}
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
                        placeholder="Tell us about your experience with pets..."
                      />
                    </div>

                    {/* Submit Button */}
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
                  </div>
                </form>
              )}

              {/* Login & Security Tab */}
              {activeTab === "security" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-primary mb-6">Login & Security</h2>
                  <p className="text-gray-600 mb-6">Manage your password and security settings</p>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Change Password</h3>
                      <p className="text-sm text-gray-600 mb-3">Update your password to keep your account secure</p>
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add the modal component before the closing tags */}
              <PasswordChangeModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                  setSuccessMessage("Password changed successfully!");
                  setTimeout(() => setSuccessMessage(""), 3000);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;