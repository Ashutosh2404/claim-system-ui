import axios from "axios";

const AUTH_API_BASE_URL = "http://localhost:8080/api";
const AUTH_BASE_URL = `${AUTH_API_BASE_URL}/auth`;
const USERS_BASE_URL = `${AUTH_API_BASE_URL}/users`;

const saveUser = (data) => {
  const token = data.accessToken || data.token;
  const user = {
    token,
    roles: data.roles || [],
    email: data.email,
    userId: data.userId,
    userName: data.userName,
  };

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("userId", user.userId);
  localStorage.setItem("userName", user.userName);

  return user;
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// Sign up (Register)
export const signUp = async (data) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/signup`, data);
    if (response.data.accessToken || response.data.token) {
      return saveUser(response.data);
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
    if (response.data.accessToken || response.data.token) {
      return saveUser(response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};

// Get current user profile
export const getUserProfile = async (userId) => {
  try {
    const token = getStoredUserInfo().token;
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
  return Boolean(getStoredUserInfo().token);
};

// Get stored user info
export const getStoredUserInfo = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error parsing stored user info:", error);
    }
  }

  return {
    userId: localStorage.getItem("userId"),
    userName: localStorage.getItem("userName"),
    token: localStorage.getItem("token"),
    roles: [],
  };
};
