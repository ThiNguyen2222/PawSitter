import axios from "axios";

// Base API setup
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: { "Content-Type": "application/json" },
});

// Reapply token after page reload
const token = localStorage.getItem("token");
if (token) {
  API.defaults.headers.common["Authorization"] = `Token ${token}`;
}

// Set or remove auth token
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// ===== Auth =====
export const registerUser = async (userData) => {
  const res = await API.post("accounts/register/", userData);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await API.post("accounts/login/", credentials);
  return res.data;
};

// ===== Sitters =====
export const getSitters = async (queryParams = {}) => {
  const res = await API.get("profiles/sitters/", { params: queryParams });
  return res.data;
};

export const getSitterProfile = async (sitterId) => {
  const res = await API.get(`profiles/sitters/${sitterId}/`);
  return res.data;
};

export const createSitterProfile = async (profileData) => {
  const res = await API.post("profiles/sitters/", profileData);
  return res.data;
};

export const updateSitterProfile = async (sitterId, profileData) => {
  const res = await API.patch(`profiles/sitters/${sitterId}/`, profileData);
  return res.data;
};

export const deleteSitterProfile = async (sitterId) => {
  const res = await API.delete(`profiles/sitters/${sitterId}/`);
  return res.data;
};

// ===== Owners =====
export const getOwnerProfile = async (ownerId) => {
  const res = await API.get(`profiles/owners/${ownerId}/`);
  return res.data;
};

export const createOwnerProfile = async (profileData) => {
  const res = await API.post("profiles/owners/", profileData);
  return res.data;
};

export const updateOwnerProfile = async (ownerId, profileData) => {
  const res = await API.patch(`profiles/owners/${ownerId}/`, profileData);
  return res.data;
};

export const deleteOwnerProfile = async (ownerId) => {
  const res = await API.delete(`profiles/owners/${ownerId}/`);
  return res.data;
};

// ===== Pets =====
export const getOwnerPets = async (ownerId) => {
  const res = await API.get(`profiles/owners/${ownerId}/pets/`);
  return res.data;
};

export const createPet = async (ownerId, petData) => {
  const res = await API.post(`profiles/owners/${ownerId}/pets/`, petData);
  return res.data;
};

export const updatePet = async (ownerId, petId, petData) => {
  const res = await API.patch(`profiles/owners/${ownerId}/pets/${petId}/`, petData);
  return res.data;
};

export const deletePet = async (ownerId, petId) => {
  const res = await API.delete(`profiles/owners/${ownerId}/pets/${petId}/`);
  return res.data;
};

// ===== Reviews =====
export const getReviews = async (queryParams = {}) => {
  const res = await API.get("reviews/", { params: queryParams });
  return res.data;
};

export const getSitterReviews = async (sitterId) => {
  const res = await API.get("reviews/", { params: { sitter: sitterId } });
  return res.data;
};

export const createReview = async (reviewData) => {
  const res = await API.post("reviews/", reviewData);
  return res.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const res = await API.patch(`reviews/${reviewId}/`, reviewData);
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await API.delete(`reviews/${reviewId}/`);
  return res.data;
};

// ===== Tags & Specialties =====
export const getTags = async () => {
  const res = await API.get("profiles/tags/");
  return res.data;
};

export const getSpecialties = async () => {
  const res = await API.get("profiles/specialties/");
  return res.data;
};

// ===== Bookings =====
export const getBookings = async () => {
  const res = await API.get("bookings/");
  return res.data;
};

export const getBooking = async (bookingId) => {
  const res = await API.get(`bookings/${bookingId}/`);
  return res.data;
};

export const createBooking = async (bookingData) => {
  const res = await API.post("bookings/", bookingData);
  return res.data;
};

export const updateBooking = async (bookingId, bookingData) => {
  const res = await API.patch(`bookings/${bookingId}/`, bookingData);
  return res.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  // status can be: "requested", "confirmed", "completed", "canceled"
  const res = await API.patch(`bookings/${bookingId}/`, { status });
  return res.data;
};

export const cancelBooking = async (bookingId) => {
  // Helper function for owners to cancel
  const res = await API.patch(`bookings/${bookingId}/`, { status: "canceled" });
  return res.data;
};

export const confirmBooking = async (bookingId) => {
  // Helper function for sitters to confirm
  const res = await API.patch(`bookings/${bookingId}/`, { status: "confirmed" });
  return res.data;
};

export const completeBooking = async (bookingId) => {
  // Helper function for sitters to mark complete
  const res = await API.patch(`bookings/${bookingId}/`, { status: "completed" });
  return res.data;
};

export const deleteBooking = async (bookingId) => {
  const res = await API.delete(`bookings/${bookingId}/`);
  return res.data;
};

export default API;
