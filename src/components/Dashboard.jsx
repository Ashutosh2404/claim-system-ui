import React, { useState, useEffect } from "react";

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

  // Mock data for fallback only
  const mockPolicies = [
    {
      id: 1,
      policyNumber: "POL-2024-001",
      policyType: "Life Insurance",
      status: "Active",
      premium: 5000,
      nextDueDate: "2024-05-15",
    },
    {
      id: 2,
      policyNumber: "POL-2024-002",
      policyType: "Health Insurance",
      status: "Active",
      premium: 3000,
      nextDueDate: "2024-05-20",
    },
    {
      id: 3,
      policyNumber: "POL-2023-005",
      policyType: "Accident Insurance",
      status: "Lapsed",
      premium: 1500,
      nextDueDate: "2024-02-10",
    },
  ];

  const mockClaims = [
    {
      id: "CLM-2024-101",
      policyId: 1,
      amount: 50000,
      status: "Approved",
      date: "2024-04-01",
    },
    {
      id: "CLM-2024-102",
      policyId: 2,
      amount: 25000,
      status: "In Review",
      date: "2024-04-05",
    },
    {
      id: "CLM-2024-103",
      policyId: 1,
      amount: 75000,
      status: "Paid",
      date: "2024-03-20",
    },
    {
      id: "CLM-2024-104",
      policyId: 2,
      amount: 15000,
      status: "In Review",
      date: "2024-04-08",
    },
  ];

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
        const response = await fetch("/api/user/profile");

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name || "User");
          setUserId(userData.userId);
          setError(null);
        } else {
          setUserName("User");
          setUserId(1); // Default fallback userId
          setError("Unable to fetch profile. Using default user.");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUserName("User");
        setUserId(1); // Default fallback userId
        setError("Unable to fetch profile. Using default user.");
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
        const response = await fetch(`/api/policies?userId=${userId}`);

        if (response.ok) {
          const policiesData = await response.json();
          setPolicies(policiesData);
          setPolicyError(null);
        } else {
          setPolicies(mockPolicies);
          setPolicyError("Using sample data. Unable to fetch policies.");
        }
      } catch (err) {
        console.error("Error fetching policies:", err);
        setPolicies(mockPolicies);
        setPolicyError("Using sample data. Unable to fetch policies.");
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
        const response = await fetch(`/api/claims?userId=${userId}`);

        if (response.ok) {
          const claimsData = await response.json();
          setClaims(sortClaimsByDate(claimsData));
          setClaimError(null);
        } else {
          setClaims(sortClaimsByDate(mockClaims));
          setClaimError("Using sample data. Unable to fetch claims.");
        }
      } catch (err) {
        console.error("Error fetching claims:", err);
        setClaims(sortClaimsByDate(mockClaims));
        setClaimError("Using sample data. Unable to fetch claims.");
      } finally {
        setLoadingClaims(false);
      }
    };

    fetchClaims();
  }, [userId]);

  // Calculate claims overview
  const claimsOverview = {
    inReview: claims.filter((c) => c.status === "In Review").length,
    approved: claims.filter((c) => c.status === "Approved").length,
    paid: claims.filter((c) => c.status === "Paid").length,
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
      <div style={styles.container}>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <h1 style={styles.heading}>Hi {userName} 👋</h1>
        <p style={styles.subtitle}>Manage your policies and claims</p>
        {error && <p style={styles.errorMessage}>{error}</p>}
      </div>

      {/* Quick Actions Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickActionsGrid}>
          <button
            style={styles.actionButton}
            onClick={() => handleQuickAction("newClaim")}
          >
            📋 Start New Claim
          </button>
          <button
            style={styles.actionButton}
            onClick={() => handleQuickAction("trackClaims")}
          >
            📍 Track Claims
          </button>

          <button
            style={styles.actionButton}
            onClick={() => handleQuickAction("documents")}
          >
            📄 Download Documents
          </button>
        </div>
      </div>

      {/* Policies Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Policies ({policies.length})</h2>
        {policyError && <p style={styles.sectionErrorMessage}>{policyError}</p>}
        {loadingPolicies ? (
          <p style={styles.loadingText}>Loading policies...</p>
        ) : policies.length === 0 ? (
          <p style={styles.emptyStateMessage}>
            No policies found. Please contact support or{" "}
            <a href="/claimservice/buy-policy">purchase a policy</a>.
          </p>
        ) : (
          <div style={styles.policiesGrid}>
            {policies.map((policy) => (
              <div key={policy.id} style={styles.policyCard}>
                <div style={styles.policyHeader}>
                  <h3 style={styles.policyNumber}>{policy.policyNumber}</h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        policy.status === "Active" ? "#10b981" : "#ef4444",
                    }}
                  >
                    {policy.status}
                  </span>
                </div>
                <p style={styles.policyDetail}>
                  <strong>Type:</strong> {policy.policyType}
                </p>
                <p style={styles.policyDetail}>
                  <strong>Premium:</strong> {formatCurrency(policy.premium)}
                </p>
                <p style={styles.policyDetail}>
                  <strong>Next Due:</strong> {formatDate(policy.nextDueDate)}
                </p>
                <div style={styles.policyActions}>
                  <button
                    style={{ ...styles.button, ...styles.secondaryButton }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claims Overview Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Claims Overview</h2>
        <div style={styles.overviewGrid}>
          <div style={styles.overviewCard}>
            <h3 style={styles.overviewValue}>{claimsOverview.inReview}</h3>
            <p style={styles.overviewLabel}>In Review</p>
          </div>
          <div style={styles.overviewCard}>
            <h3 style={styles.overviewValue}>{claimsOverview.approved}</h3>
            <p style={styles.overviewLabel}>Approved</p>
          </div>
          <div style={styles.overviewCard}>
            <h3 style={styles.overviewValue}>{claimsOverview.paid}</h3>
            <p style={styles.overviewLabel}>Paid</p>
          </div>
        </div>
      </div>

      {/* Recent Claims Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Claims</h2>
        {claimError && <p style={styles.sectionErrorMessage}>{claimError}</p>}
        {loadingClaims ? (
          <p style={styles.loadingText}>Loading claims...</p>
        ) : recentClaims.length === 0 ? (
          <p style={styles.emptyStateMessage}>
            No claims submitted yet.{" "}
            <a href="/claimservice/claim/start">Start a claim now</a>.
          </p>
        ) : (
          <div style={styles.claimsTable}>
            <div style={styles.tableHeader}>
              <div style={{ ...styles.tableCell, flex: 1 }}>Claim ID</div>
              <div style={{ ...styles.tableCell, flex: 1 }}>Amount</div>
              <div style={{ ...styles.tableCell, flex: 1 }}>Status</div>
              <div style={{ ...styles.tableCell, flex: 1 }}>Date</div>
            </div>
            {recentClaims.map((claim) => (
              <div key={claim.id} style={styles.tableRow}>
                <div style={{ ...styles.tableCell, flex: 1 }}>{claim.id}</div>
                <div style={{ ...styles.tableCell, flex: 1 }}>
                  {formatCurrency(claim.amount)}
                </div>
                <div style={{ ...styles.tableCell, flex: 1 }}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        claim.status === "Paid"
                          ? "#10b981"
                          : claim.status === "Approved"
                            ? "#3b82f6"
                            : "#f59e0b",
                    }}
                  >
                    {claim.status}
                  </span>
                </div>
                <div style={{ ...styles.tableCell, flex: 1 }}>
                  {formatDate(claim.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9fafb",
  },
  headerSection: {
    marginBottom: "40px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  heading: {
    fontSize: "32px",
    margin: "0 0 10px 0",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: 0,
  },
  errorMessage: {
    color: "#dc2626",
    marginTop: "10px",
    fontSize: "14px",
  },
  sectionErrorMessage: {
    color: "#dc2626",
    padding: "12px",
    backgroundColor: "#fee2e2",
    borderRadius: "6px",
    marginBottom: "15px",
    fontSize: "14px",
  },
  loadingText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    padding: "20px",
  },
  emptyStateMessage: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    padding: "20px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
  },
  section: {
    marginBottom: "30px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "24px",
    margin: "0 0 20px 0",
    color: "#1f2937",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: "10px",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  actionButton: {
    padding: "15px 20px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  policiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
  },
  policyCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f9fafb",
  },
  policyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  policyNumber: {
    margin: 0,
    fontSize: "18px",
    color: "#1f2937",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
  },
  policyDetail: {
    margin: "8px 0",
    fontSize: "14px",
    color: "#4b5563",
  },
  policyActions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },
  button: {
    flex: 1,
    padding: "10px 15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  primaryButton: {
    backgroundColor: "#10b981",
    color: "#fff",
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
  },
  overviewCard: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
  },
  overviewValue: {
    fontSize: "36px",
    margin: "0",
    color: "#3b82f6",
  },
  overviewLabel: {
    margin: "10px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  claimsTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    display: "flex",
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    borderBottom: "2px solid #e5e7eb",
    padding: "12px",
  },
  tableRow: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    alignItems: "center",
  },
  tableCell: {
    fontSize: "14px",
    color: "#4b5563",
  },
};

// Add link styles for empty state messages
const linkStyle = {
  color: "#3b82f6",
  textDecoration: "none",
  fontWeight: "bold",
  cursor: "pointer",
};

// Inject link style into shadow DOM if needed
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .dashboard a { color: #3b82f6; text-decoration: none; font-weight: bold; }
    .dashboard a:hover { text-decoration: underline; }
  `;
  if (document.head && !document.querySelector("style[data-dashboard]")) {
    style.setAttribute("data-dashboard", "true");
    document.head.appendChild(style);
  }
}

export default Dashboard;
