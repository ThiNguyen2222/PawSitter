// src/pages/owner/EditProfile.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import { getMyOwnerProfile, updateOwnerProfile, createPet, updatePet, deletePet } from "../../api/api";
import { getSitterImage, getPetImage } from "./dashboard/utils";

const EditProfile = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [activeTab, setActiveTab] = useState("account");
  const [pets, setPets] = useState([]);
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [petFormData, setPetFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    notes: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [bannerPicture, setBannerPicture] = useState(null);
  const [petProfilePicture, setPetProfilePicture] = useState(null);
  const [petProfilePicturePreview, setPetProfilePicturePreview] = useState("");

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
        const data = await getMyOwnerProfile();
        setOwnerId(data.id);
        
        setFormData({
          name: data.name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          notes: data.notes || "",
        });

        setPets(Array.isArray(data.pets) ? data.pets : []);

        // Set profile picture preview
        if (data.profile_picture_url) {
          const picUrl = data.profile_picture_url.startsWith("http")
            ? data.profile_picture_url
            : `http://127.0.0.1:8000${data.profile_picture_url}`;
          setProfilePicturePreview(picUrl);
        } else {
          setProfilePicturePreview(getSitterImage(null, 0));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
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

  // Handle pet input changes
  const handlePetChange = (e) => {
    const { name, value } = e.target;
    setPetFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner picture selection
  const handleBannerPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerPicture(file);
    }
  };

  // Handle pet profile picture selection
  const handlePetProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile picture
  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(getSitterImage(null, 0));
  };

  // Reset pet form
  const resetPetForm = () => {
    setPetFormData({
      name: "",
      species: "",
      breed: "",
      age: "",
      notes: "",
    });
    setPetProfilePicture(null);
    setPetProfilePicturePreview("");
    setEditingPet(null);
    setShowPetForm(false);
  };

  // Handle add new pet
  const handleAddPet = () => {
    resetPetForm();
    setShowPetForm(true);
  };

  // Handle edit pet
  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setPetFormData({
      name: pet.name || "",
      species: pet.species || "",
      breed: pet.breed || "",
      age: pet.age || "",
      notes: pet.notes || "",
    });
    
    // Set existing profile picture
    if (pet.profile_picture_url) {
      const picUrl = pet.profile_picture_url.startsWith("http")
        ? pet.profile_picture_url
        : `http://127.0.0.1:8000${pet.profile_picture_url}`;
      setPetProfilePicturePreview(picUrl);
    } else {
      setPetProfilePicturePreview(getPetImage(pet.species));
    }
    
    setShowPetForm(true);
  };

  // Handle delete pet
  const handleDeletePet = async (petId) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) {
      return;
    }

    try {
      await deletePet(ownerId, petId);
      setPets(pets.filter((pet) => pet.id !== petId));
      setSuccessMessage("Pet deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting pet:", err);
      setError("Failed to delete pet.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle pet form submission
  const handlePetSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", petFormData.name);
      formDataToSend.append("species", petFormData.species);
      formDataToSend.append("breed", petFormData.breed);
      formDataToSend.append("age", petFormData.age);
      formDataToSend.append("notes", petFormData.notes);

      if (petProfilePicture) {
        formDataToSend.append("profile_picture", petProfilePicture);
      }

      if (editingPet) {
        // Update existing pet
        const response = await fetch(
          `http://127.0.0.1:8000/api/profiles/owners/${ownerId}/pets/${editingPet.id}/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            body: formDataToSend,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update pet");
        }

        const updatedPet = await response.json();
        setPets(pets.map((p) => (p.id === editingPet.id ? updatedPet : p)));
        setSuccessMessage("Pet updated successfully!");
      } else {
        // Create new pet
        const response = await fetch(
          `http://127.0.0.1:8000/api/profiles/owners/${ownerId}/pets/`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            body: formDataToSend,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create pet");
        }

        const newPet = await response.json();
        setPets([...pets, newPet]);
        setSuccessMessage("Pet added successfully!");
      }

      resetPetForm();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving pet:", err);
      setError("Failed to save pet. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("notes", formData.notes);

      if (profilePicture) {
        formDataToSend.append("profile_picture", profilePicture);
      }

      if (bannerPicture) {
        formDataToSend.append("banner_picture", bannerPicture);
      }

      const response = await fetch(`http://127.0.0.1:8000/api/profiles/owners/${ownerId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully!");
      
      setTimeout(() => {
        navigate("/owner/profile");
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper to get pet image URL
  const getPetImageUrl = (pet) => {
    if (pet.profile_picture_url) {
      if (pet.profile_picture_url.startsWith("http")) {
        return pet.profile_picture_url;
      }
      return `http://127.0.0.1:8000${pet.profile_picture_url}`;
    }
    return getPetImage(pet.species);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading profile...</div>;
  }

  return (
    <>
      <ResponsiveMenu open={open} />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-primary mb-6">Account Settings</h2>
                
                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab("account");
                      setShowPetForm(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      activeTab === "account"
                        ? "bg-primary text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Account Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab("pets");
                      setShowPetForm(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      activeTab === "pets"
                        ? "bg-primary text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    My Pets
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab("security");
                      setShowPetForm(false);
                    }}
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
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
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
                      <label className="bg-secondary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-secondary/90 transition cursor-pointer inline-block">
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
                          Phone number
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
                    </div>

                    {/* Bio */}
                    <div className="mb-8">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Tell us about yourself and your pets..."
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

              {/* My Pets Tab */}
              {activeTab === "pets" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-primary">My Pets</h2>
                    {!showPetForm && (
                      <button
                        onClick={handleAddPet}
                        className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition"
                      >
                        + Add Pet
                      </button>
                    )}
                  </div>

                  {showPetForm ? (
                    <form onSubmit={handlePetSubmit} className="border border-gray-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingPet ? "Edit Pet" : "Add New Pet"}
                      </h3>

                      {/* Pet Profile Picture */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pet Profile Picture
                        </label>
                        <div className="flex items-center gap-4">
                          {petProfilePicturePreview && (
                            <img
                              src={petProfilePicturePreview}
                              alt="Pet Preview"
                              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                            />
                          )}
                          <label className="bg-secondary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-secondary/90 transition cursor-pointer">
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePetProfilePictureChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="pet-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="pet-name"
                            name="name"
                            value={petFormData.name}
                            onChange={handlePetChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter pet's name"
                          />
                        </div>

                        <div>
                          <label htmlFor="pet-species" className="block text-sm font-medium text-gray-700 mb-2">
                            Species *
                          </label>
                          <input
                            type="text"
                            id="pet-species"
                            name="species"
                            value={petFormData.species}
                            onChange={handlePetChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., Dog, Cat, Bird"
                          />
                        </div>

                        <div>
                          <label htmlFor="pet-breed" className="block text-sm font-medium text-gray-700 mb-2">
                            Breed
                          </label>
                          <input
                            type="text"
                            id="pet-breed"
                            name="breed"
                            value={petFormData.breed}
                            onChange={handlePetChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter breed"
                          />
                        </div>

                        <div>
                          <label htmlFor="pet-age" className="block text-sm font-medium text-gray-700 mb-2">
                            Age *
                          </label>
                          <input
                            type="number"
                            id="pet-age"
                            name="age"
                            value={petFormData.age}
                            onChange={handlePetChange}
                            required
                            min="0"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Age in years"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <label htmlFor="pet-notes" className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          id="pet-notes"
                          name="notes"
                          value={petFormData.notes}
                          onChange={handlePetChange}
                          rows="3"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          placeholder="Any special notes about your pet..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className={`bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition ${
                            saving ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {saving ? "Saving..." : editingPet ? "Update Pet" : "Add Pet"}
                        </button>
                        <button
                          type="button"
                          onClick={resetPetForm}
                          className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* Pets List */}
                  {pets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">You haven't added any pets yet.</p>
                      <button
                        onClick={handleAddPet}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition"
                      >
                        Add Your First Pet
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pets.map((pet) => (
                        <div
                          key={pet.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex gap-4">
                            <img
                              src={getPetImageUrl(pet)}
                              onError={(e) => (e.target.src = getPetImage("default"))}
                              alt={pet.name}
                              className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
                              <p className="text-gray-600 text-sm capitalize">
                                {pet.species} {pet.breed && `— ${pet.breed}`}
                              </p>
                              <p className="text-gray-500 text-sm">Age: {pet.age} years</p>
                              {pet.notes && (
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{pet.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleEditPet(pet)}
                              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePet(pet.id)}
                              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                      <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition">
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                      <button className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition">
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