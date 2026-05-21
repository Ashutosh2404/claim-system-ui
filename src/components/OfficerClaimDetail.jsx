import React, { useState } from "react";

// Props:
// - claim: object (full claim detail)
// - reason: string
// - setReason: function
// - onDecision: async function(decision)
// - loading: boolean
// - error: string|null

const OfficerClaimDetail = ({
  claim,
  reason,
  setReason,
  onDecision,
  loading,
  error,
}) => {
  const [validationError, setValidationError] = useState(null);

  if (!claim) {
    return (
      <div className="p-4 text-sm text-gray-600">
        Select a claim to view details.
      </div>
    );
  }

  const claimantName =
    claim.customerName ||
    claim.claimantName ||
    claim.customer?.fullName ||
    "N/A";
  const claimantPhone = claim.customerPhone || claim.customer?.phone || "N/A";
  const policyType = claim.policy?.policyType || "N/A";
  const coverageAmount =
    claim.policy?.sumAssured || claim.policy?.coverageAmount || "N/A";

  const validationStatus = claim.validationStatus || null;
  const missingDocuments = Array.isArray(claim.missingDocuments)
    ? claim.missingDocuments
    : [];
  const documents = Array.isArray(claim.documents) ? claim.documents : [];
  const docsComplete =
    validationStatus === "COMPLETE" && missingDocuments.length === 0;

  const history = Array.isArray(claim.history) ? claim.history : [];

  const aiSummary =
    claim.aiSummary || claim.summaryText || "No AI summary available.";
  //   const slaScore =
  //     claim.aiSummary && typeof claim.aiSummary.slaRiskScore === "number"
  //       ? claim.aiSummary.slaRiskScore
  //       : null;
  const slaScore =
    typeof claim.slaRiskScore === "number"
      ? claim.slaRiskScore
      : claim.aiSummary && typeof claim.aiSummary.slaRiskScore === "number"
        ? claim.aiSummary.slaRiskScore
        : null;


  const getSlaRiskBadge = (score) => {
    if (score === null) {
      return { label: "N/A", className: "bg-gray-100 text-gray-700" };
    }
    if (score <= 0.3) {
      return { label: "Low", className: "bg-green-100 text-green-800" };
    }
    if (score <= 0.7) {
      return { label: "Medium", className: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "High", className: "bg-red-100 text-red-800" };
  };

  const slaBadge = getSlaRiskBadge(slaScore);
  
  const statusSubtitle = ["PENDING", "UNDER_REVIEW"].includes(claim.status)
    ? "Manual Review"
    : "";
  const createdDate = claim.createdAt || claim.date || null;
  const formattedCreated = createdDate
    ? new Date(createdDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const handleDecisionClick = async (decisionType) => {
    if (!reason || reason.trim() === "") {
      setValidationError("Decision reason is required.");
      return;
    }
    setValidationError(null);
    await onDecision(decisionType);
  };

  //   const slaScore = pc.aiSummary?.slaRiskScore;
  //   const slaBadge = getSlaRiskBadge(slaScore);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Claim Details</h3>
          {statusSubtitle && (
            <p className="text-sm text-gray-500">{statusSubtitle}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${slaBadge.className}`}
        >
          {slaBadge.label}
          {slaScore !== null ? ` · ${slaScore}` : ""}
        </span>
      </div>

      <div className="grid gap-4 text-sm text-gray-600 mb-6">
        <div className="space-y-2">
          <p>
            <strong>Claim ID:</strong>{" "}
            <span className="text-gray-800">{claim.id}</span>
          </p>
          <p>
            <strong>Policy ID:</strong>{" "}
            <span className="text-gray-800">
              {claim.policyId || claim.policy?.id || "N/A"}
            </span>
          </p>
          <p>
            <strong>Type:</strong>{" "}
            <span className="text-gray-800">
              {claim.claimType || claim.type || "N/A"}
            </span>
          </p>
          <p>
            <strong>Amount:</strong>{" "}
            <span className="text-gray-800">
              {claim.claimAmount ?? claim.amount ?? "N/A"}
            </span>
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-gray-800">{claim.status || "N/A"}</span>
          </p>
          <p>
            <strong>Created:</strong>{" "}
            <span className="text-gray-800">{formattedCreated}</span>
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Policyholder
          </p>
          <div className="space-y-1 text-gray-600">
            <p>
              <strong>Name:</strong>{" "}
              <span className="text-gray-800">{claimantName}</span>
            </p>
            <p>
              <strong>Contact:</strong>{" "}
              <span className="text-gray-800">{claimantPhone}</span>
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-2">Policy</p>
          <div className="space-y-1 text-gray-600">
            <p>
              <strong>Type:</strong>{" "}
              <span className="text-gray-800">{policyType}</span>
            </p>
            <p>
              <strong>Coverage:</strong>{" "}
              <span className="text-gray-800">{coverageAmount}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-gray-200 pt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Summary</h4>
        <div className="prose text-sm text-gray-800 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          {aiSummary}
        </div>
      </div>

      <div className="mb-6 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Documentation</h4>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${docsComplete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
          >
            {docsComplete ? "Docs Complete" : "Missing Docs"}
          </span>
        </div>

        {missingDocuments.length > 0 ? (
          <div className="mb-3 text-sm text-gray-700">
            <p className="font-medium mb-2">Missing items:</p>
            <ul className="list-disc list-inside space-y-1">
              {missingDocuments.map((item, index) => (
                <li key={`missing-${index}`} className="text-gray-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {documents.length > 0 ? (
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">Uploaded documents:</p>
            <ul className="space-y-2">
              {documents.map((doc, index) => (
                <li
                  key={`doc-${index}`}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs">
                    •
                  </span>
                  <span>{doc.documentType || doc.type || "Document"}</span>
                  <span className="text-gray-500">
                    ({doc.fileName || "unknown file"})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {missingDocuments.length === 0 && documents.length === 0 ? (
          <p className="text-sm text-gray-500">
            No document details available.{" "}
            {/* TODO: wire backend document fields here */}
          </p>
        ) : null}
      </div>

      <div className="mb-6 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">History</h4>
          <span className="text-xs text-gray-500">Latest events</span>
        </div>
        {history.length > 0 ? (
          <div className="max-h-32 overflow-y-auto space-y-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
            {history.map((event, index) => {
              const time = event.timestamp
                ? new Date(event.timestamp).toLocaleString("en-IN")
                : "Unknown time";
              return (
                <div
                  key={`history-${index}`}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <p className="font-medium text-gray-800">
                    {event.type || "UNKNOWN"} by {event.actor || "SYSTEM"}
                  </p>
                  <p className="text-xs text-gray-500">{time}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            History not available in this demo.
          </p>
        )}
      </div>

      <div className="mb-4 border-t border-gray-200 pt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Decision Reason
        </h4>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (validationError) {
              setValidationError(null);
            }
          }}
          rows={4}
          className="w-full border border-gray-200 rounded p-2 text-sm"
          placeholder="Enter short reason for approval or rejection"
        />
      </div>

      {validationError && (
        <div className="mb-3 text-sm text-amber-700">{validationError}</div>
      )}

      {error && <div className="mb-3 text-sm text-red-600">Error: {error}</div>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          disabled={loading}
          onClick={() => handleDecisionClick("APPROVE")}
          className={`px-4 py-2 rounded font-semibold text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
        >
          {loading ? "Processing..." : "Approve"}
        </button>

        <button
          disabled={loading}
          onClick={() => handleDecisionClick("REJECT")}
          className={`px-4 py-2 rounded font-semibold text-white ${loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}`}
        >
          {loading ? "Processing..." : "Reject"}
        </button>
      </div>
    </div>
  );
};

export default OfficerClaimDetail;
