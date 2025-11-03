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

// ===== Bookings =====
export const getBookings = async () => {
  const res = await API.get("bookings/");
  return res.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const res = await API.patch(`bookings/${bookingId}/`, { status });
  return res.data;
};

// ===== Owner =====
export const getOwnerProfile = async (ownerId) => {
  const res = await API.get(`profiles/owners/${ownerId}/`);
  return res.data;
};

export const getOwnerPets = async (ownerId) => {
  const res = await API.get(`profiles/owners/${ownerId}/pets/`);
  return res.data;
};

// ===== Sitter =====
export const getSitterProfile = async (sitterId) => {
  const res = await API.get(`sitters/${sitterId}/`);
  return res.data;
};

export const getSitterReviews = async (sitterId) => {
  const res = await API.get(`reviews/?sitter=${sitterId}`);
  return res.data;
};

// ===== Availability =====
export const getAvailabilitySlots = async () => {
  const res = await API.get("availability/");
  return res.data;
};

// ===== General =====
export const getSitters = async () => {
  const res = await API.get("sitters/");
  return res.data;
};

export default API;
