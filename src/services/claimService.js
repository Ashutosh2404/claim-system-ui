import axios from "axios";
import { getStoredUserInfo } from "./authService";

const API_BASE_URL = "http://localhost:8081/api";
const CLAIMS_BASE_URL = `${API_BASE_URL}/claims`;
const POLICIES_BASE_URL = `${API_BASE_URL}/policies`;

const OFFICER_CLAIMS_BASE_URL = `${API_BASE_URL}/officer/claims`;

// ==================== CLAIM ENDPOINTS ====================

// Create claim
export const createClaim = async (data) => {
  try {
    // data may include policyNumber and documentNames for demonstration of backend AI/OCR integration
    const response = await axios.post(CLAIMS_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating claim:", error);
    throw error;
  }
};

// Get policy by number
export const getPolicyByNumber = async (policyNumber) => {
  try {
    const response = await axios.get(`${POLICIES_BASE_URL}/by-number/${policyNumber}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching policy by number:", error);
    throw error;
  }
};

// Get all claims
export const getAllClaims = async () => {
  try {
    const response = await axios.get(CLAIMS_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching claims:", error);
    throw error;
  }
};

// Get claim by ID
export const getClaimById = async (id) => {
  try {
    const response = await axios.get(`${CLAIMS_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching claim:", error);
    throw error;
  }
};

// Update claim status
export const updateClaimStatus = async (id, data) => {
  try {
    const response = await axios.put(`${CLAIMS_BASE_URL}/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating claim:", error);
    throw error;
  }
};

// ==================== POLICY ENDPOINTS ====================

// Get all policies
export const getAllPolicies = async () => {
  try {
    const response = await axios.get(POLICIES_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching policies:", error);
    throw error;
  }
};

// Get policies by customer ID
export const getPoliciesByCustomerId = async (customerId) => {
  try {
    const response = await axios.get(`${POLICIES_BASE_URL}/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching policies for customer:", error);
    throw error;
  }
};

// Get policy by ID
export const getPolicyById = async (id) => {
  try {
    const response = await axios.get(`${POLICIES_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching policy:", error);
    throw error;
  }
};

// Create policy
export const createPolicy = async (data) => {
  try {
    const response = await axios.post(POLICIES_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating policy:", error);
    throw error;
  }
};

// Update policy
export const updatePolicy = async (id, data) => {
  try {
    const response = await axios.put(`${POLICIES_BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating policy:", error);
    throw error;
  }
};

// Delete policy
export const deletePolicy = async (id) => {
  try {
    const response = await axios.delete(`${POLICIES_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting policy:", error);
    throw error;
  }
};

// ==================== OFFICER ENDPOINTS ====================

// Get pending claims for officer review
export const getPendingClaimsForOfficer = async () => {
  try {
    const token = getStoredUserInfo().token;
    const response = await axios.get(`${OFFICER_CLAIMS_BASE_URL}/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pending claims for officer:", error);
    throw error;
  }
};

// Get full claim detail for officer (includes aiSummary, slaRiskScore, etc.)
export const getClaimDetailForOfficer = async (claimId) => {
  try {
    const token = getStoredUserInfo().token;
    const response = await axios.get(`${OFFICER_CLAIMS_BASE_URL}/${claimId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching officer claim detail:", error);
    throw error;
  }
};

// Submit officer decision (APPROVE | REJECT) with reason
export const submitOfficerDecision = async (claimId, decision, reason) => {
  try {
    const token = getStoredUserInfo().token;
    const payload = { decision, reason };
    const response = await axios.post(`${OFFICER_CLAIMS_BASE_URL}/${claimId}/decision`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting officer decision:", error);
    throw error;
  }
};