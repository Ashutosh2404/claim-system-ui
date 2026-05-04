import axios from "axios";

const AUTH_API_BASE_URL = "http://localhost:8080/api";
const AUTH_BASE_URL = `${AUTH_API_BASE_URL}/auth`;
const USERS_BASE_URL = `${AUTH_API_BASE_URL}/users`;

// ==================== AUTHENTICATION ENDPOINTS ====================

// Sign up (Register)
export const signUp = async (data) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/signup`, data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userName", response.data.userName);
    }
    return response.data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Login
export const login = async (data) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/login`, data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userName", response.data.userName);
    }
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};

// Get current user profile
export const getUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${USERS_BASE_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Get stored user info
export const getStoredUserInfo = () => {
  return {
    userId: localStorage.getItem("userId"),
    userName: localStorage.getItem("userName"),
    token: localStorage.getItem("token"),
  };
};
