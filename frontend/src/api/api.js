import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await API.post("accounts/register/", userData);
    return response.data;
  } catch (err) {
    throw err; 
  }
};

// Login user
export const loginUser = async (credentials) => {
  const response = await API.post("accounts/login/", {
    username: credentials.username,
    password: credentials.password,
  });
  return response.data;
};


// ========== DASHBOARD APIs ==========

// Bookings
export const getBookings = async () => {
  const response = await API.get("bookings/");
  return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await API.patch(`bookings/${bookingId}/`, { status }); 
  return response.data;
};

// Owner Profile & Pets
export const getOwnerProfile = async (ownerId) => {
  const response = await API.get(`profiles/owners/${ownerId}/`); 
  return response.data;
};

export const getOwnerPets = async (ownerId) => {
  const response = await API.get(`profiles/owners/${ownerId}/pets/`); 
  return response.data;
};

// Sitter Profile & Reviews
export const getSitterProfile = async (sitterId) => {
  const response = await API.get(`profiles/sitters/${sitterId}/`);
  return response.data;
};

export const getSitterReviews = async (sitterId) => {
  const response = await API.get(`reviews/?sitter=${sitterId}`); 
  return response.data;
};

// Availability
export const getAvailabilitySlots = async () => {
  const response = await API.get("availability/");
  return response.data;
};
