import React, { useState, useEffect } from "react";
import { getUserProfile } from "../services/authService";
import { getAllClaims, getPoliciesByCustomerId } from "../services/claimService";

const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [error, setError] = useState(null);
  const [policyError, setPolicyError] = useState(null);
  const [claimError, setClaimError] = useState(null);


  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const sortClaimsByDate = (claimsArray) => {
    return [...claimsArray].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Fetch user profile first
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingUser(true);
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!storedUserId || !token) {
          setUserName("User");
          setUserId(1);
          setError("User not authenticated");
          return;
        }

        const userData = await getUserProfile(storedUserId);
        const fullName = `${userData.firstName} ${userData.lastName}`;
        setUserName(fullName);
        setUserId(storedUserId);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUserName("User");
        setUserId(localStorage.getItem('userId') || 1);
        setError("Unable to fetch profile data");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch policies after userId is obtained
  useEffect(() => {
    if (!userId) return;

    const fetchPolicies = async () => {
      try {
        setLoadingPolicies(true);
        const policiesData = await getPoliciesByCustomerId(userId);
        setPolicies(policiesData);
        setPolicyError(null);
      } catch (err) {
        console.error("Error fetching policies:", err);
        setPolicies([]);
        setPolicyError("Unable to fetch policies from server");
      } finally {
        setLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, [userId]);

  // Fetch claims after userId is obtained
  useEffect(() => {
    if (!userId) return;

    const fetchClaims = async () => {
      try {
        setLoadingClaims(true);
        const claimsData = await getAllClaims();
        // Filter claims for current user if needed, or adjust based on backend response
        setClaims(sortClaimsByDate(claimsData));
        setClaimError(null);
      } catch (err) {
        console.error("Error fetching claims:", err);
        setClaims([]);
        setClaimError("Unable to fetch claims from server");
      } finally {
        setLoadingClaims(false);
      }
    };

    fetchClaims();
  }, [userId]);

  // Calculate claims overview
  const claimsOverview = {
    inReview: claims.filter((c) => c.status === "UNDER_REVIEW" || c.status === "PENDING_MANUAL_REVIEW").length,
    approved: claims.filter((c) => c.status === "APPROVED").length,
    paid: claims.filter((c) => c.status === "PAID").length,
  };

  // Get recent claims (last 3) - already sorted by date
  const recentClaims = claims.slice(0, 3);

  // Navigation handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "newClaim":
        window.location.href = "/claimservice/claim/start";
        break;
      case "trackClaims":
        window.location.href = "/claimservice/claims";
        break;
      case "documents":
        window.location.href = "/claimservice/documents";
        break;
      default:
        break;
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Hi {userName} 👋</h1>
              <p className="text-indigo-100 text-lg">Manage your policies and claims</p>
            </div>
            <div className="mt-6 sm:mt-0">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-4">
                <p className="text-indigo-100 text-sm">Welcome back!</p>
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-6 bg-red-500 bg-opacity-20 border border-red-200 rounded-lg p-4">
              <p className="text-red-100 text-sm">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => handleQuickAction("newClaim")}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Start New Claim
              </span>
            </button>

            <button
              onClick={() => handleQuickAction("trackClaims")}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Track Claims
              </span>
            </button>

            <button
              onClick={() => handleQuickAction("documents")}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Download Documents
              </span>
            </button>
          </div>
        </div>

        {/* Claims Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{claimsOverview.inReview}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{claimsOverview.approved}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Paid</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{claimsOverview.paid}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M2 9a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V9zm12-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Policies ({policies.length})</h2>
            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
              {policies.length} Active
            </span>
          </div>

          {policyError && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
              <p className="text-amber-800 text-sm">ℹ️ {policyError}</p>
            </div>
          )}

          {loadingPolicies ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">No policies found. Please contact support or 
                <a href="/claimservice/buy-policy" className="text-indigo-600 font-semibold ml-1 hover:text-indigo-700">purchase a policy</a>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-50 to-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Policy ID</p>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">{policy.policyNumber}</h3>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        policy.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {policy.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm">Type</p>
                      <p className="text-gray-900 font-semibold">{policy.policyType}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm">Premium</p>
                      <p className="text-gray-900 font-semibold text-lg">{formatCurrency(policy.premiumAmount)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm">Next Due</p>
                      <p className="text-gray-900 font-semibold">{formatDate(policy.nextDue)}</p>
                    </div>
                  </div>

                  <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg transition duration-200">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Claims Section */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Claims</h2>
            <a href="/claimservice/claims" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2">
              View All →
            </a>
          </div>

          {claimError && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
              <p className="text-amber-800 text-sm">ℹ️ {claimError}</p>
            </div>
          )}

          {loadingClaims ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : recentClaims.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">No claims submitted yet. 
                <a href="/claimservice/claim/start" className="text-indigo-600 font-semibold ml-1 hover:text-indigo-700">Start a claim now</a>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Claim ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{claim.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(claim.amount)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            claim.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : claim.status === "APPROVED"
                              ? "bg-blue-100 text-blue-800"
                              : claim.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(claim.date)}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
