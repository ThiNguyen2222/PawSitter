import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

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
  try {
    const response = await API.post("accounts/login/", credentials);
    return response.data;
  } catch (err) {
    throw err;
  }
};