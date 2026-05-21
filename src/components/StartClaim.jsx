import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createClaim, getPolicyByNumber } from "../services/claimService";

const StartClaim = () => {
  const navigate = useNavigate();
  const { policyId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [userId] = useState(() => Number(localStorage.getItem("userId") || 0));
  const [policyNumber, setPolicyNumber] = useState(policyId || "");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyLookupLoading, setPolicyLookupLoading] = useState(false);
  const [policyLookupError, setPolicyLookupError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [claimNumber, setClaimNumber] = useState("");
  const [generalError, setGeneralError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    claimType: "",
    incidentDate: getTodayDate(),
    claimAmount: "",
    description: "",
    isAccidentalDeath: false,
  });

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  const getRequiredDocuments = (claimType, isAccidental = false) => {
    if (claimType === "Death") {
      const mandatory = [
        "Death Certificate",
        "Claimant Statement Form",
        "ID Proof",
        "Address Proof",
        "PAN Card",
        "Bank Proof",
        "Claimant Photograph",
      ];

      const conditional = [];
      if (isAccidental) {
        conditional.push("FIR Report", "Postmortem Report");
      }

      return { mandatory, conditional };
    }

    if (claimType === "Maturity") {
      return {
        mandatory: [
          "Policy Document / Policy Number",
          "ID Proof",
          "PAN Card",
          "Bank Proof",
        ],
        conditional: [],
      };
    }

    return { mandatory: [], conditional: [] };
  };

  const determineClaimType = (policyType) => {
    if (!policyType) return "";
    if (/maturity/i.test(policyType)) return "Maturity";
    if (/life/i.test(policyType)) return "Death";
    return "";
  };

  const fetchPolicy = async (lookupNumber) => {
    if (!lookupNumber?.trim()) {
      setPolicyLookupError("Please enter a policy number.");
      return;
    }

    setPolicyLookupLoading(true);
    setPolicyLookupError(null);
    setGeneralError(null);

    try {
      const policy = await getPolicyByNumber(lookupNumber.trim());
      if (!policy || !policy.policyNumber) {
        throw new Error("Policy not found");
      }

      setSelectedPolicy(policy);
      setPolicyNumber(policy.policyNumber);
      const defaultType = determineClaimType(policy.policyType);
      setFormData((prev) => ({
        ...prev,
        claimType: defaultType || prev.claimType,
      }));
      setValidationErrors((prev) => ({ ...prev, policy: null }));
    } catch (error) {
      console.error("Policy lookup error:", error);
      setSelectedPolicy(null);
      setPolicyLookupError("Policy not found or not linked to your account.");
    } finally {
      setPolicyLookupLoading(false);
    }
  };

  useEffect(() => {
    if (policyId) {
      fetchPolicy(policyId);
    }
  }, [policyId]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePolicyLookup = () => {
    if (!policyNumber.trim()) {
      setPolicyLookupError("Please enter a policy number.");
      return;
    }
    fetchPolicy(policyNumber);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    let fileError = null;
    const acceptedFiles = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        fileError = `File "${file.name}" exceeds the 5MB limit.`;
      } else {
        acceptedFiles.push(file);
      }
    });

    if (fileError) {
      setValidationErrors((prev) => ({ ...prev, documents: fileError }));
    }

    if (acceptedFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!policyNumber.trim()) {
        errors.policy = "Policy number is required.";
      }
      if (!selectedPolicy) {
        errors.policy = "Please fetch a valid policy before continuing.";
      } else if (selectedPolicy.status !== "ACTIVE") {
        errors.policy = "Policy must be ACTIVE to continue.";
      }
    }

    if (step === 2) {
      if (!formData.claimType) {
        errors.claimType = "Please select a claim type.";
      }
      if (!formData.incidentDate) {
        errors.incidentDate = "Please select an incident date.";
      }
      if (!formData.claimAmount || Number(formData.claimAmount) <= 0) {
        errors.claimAmount = "Please enter a valid claim amount.";
      }
      if (!formData.description.trim()) {
        errors.description = "Please provide claim details.";
      }
    }

    if (step === 3) {
      if (uploadedFiles.length === 0) {
        errors.documents = "Please upload at least one supporting document.";
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedPolicy) {
      errors.policy = "Please verify your policy before submitting.";
    } else if (selectedPolicy.status !== "ACTIVE") {
      errors.policy = "Policy must be ACTIVE to file a claim.";
    }

    if (!formData.claimType) {
      errors.claimType = "Please select a claim type.";
    }
    if (!formData.incidentDate) {
      errors.incidentDate = "Please select a date.";
    }
    if (!formData.claimAmount || Number(formData.claimAmount) <= 0) {
      errors.claimAmount = "Please enter a valid claim amount.";
    }
    if (!formData.description.trim()) {
      errors.description = "Please provide claim details.";
    }
    if (uploadedFiles.length === 0) {
      errors.documents = "Please upload at least one supporting document.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setGeneralError(null);

      // Backend derives customerId and policyId from the authenticated user and policy lookup.
      // policyNumber + documentNames are used by backend to validate ownership and simulate AI/OCR processing.
      const payload = {
        policyNumber: selectedPolicy?.policyNumber || policyNumber.trim(),
        claimType: formData.claimType,
        claimAmount: Number(formData.claimAmount),
        incidentDate: formData.incidentDate,
        description: formData.description,
        documentNames: uploadedFiles.map((file) => file.name),
      };

      const result = await createClaim(payload);
      setClaimNumber(result.claimNumber || result.id || "");
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting claim:", error);
      setGeneralError(
        "Failed to submit claim. Please check whether Claim Service is running on port 8081."
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2500);

    return () => clearTimeout(timer);
  }, [success, navigate]);

  const stepTitles = [
    "Policy Verification",
    "Claim Details",
    "Upload Documents",
    "Review & Submit",
  ];

  const { mandatory, conditional } = getRequiredDocuments(
    formData.claimType,
    formData.isAccidentalDeath
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl bg-white p-10 shadow-md">
            <div className="space-y-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
                Claim Submitted
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Claim Submitted Successfully!
              </h1>
              <p className="text-gray-600">
                Claim Number: <span className="font-semibold text-gray-900">{claimNumber || "N/A"}</span>
              </p>
              <p className="text-gray-500">
                You will be redirected back to the Dashboard shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
              Start Claim
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900">
              Submit a Claim in 4 Steps
            </h1>
            <p className="mt-2 text-gray-600">
              Follow the wizard to verify policy, add claim details, upload documents, and submit.
            </p>
          </div>

          {generalError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {generalError}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-4">
            {stepTitles.map((title, index) => {
              const stepIndex = index + 1;
              const isActive = stepIndex === currentStep;
              return (
                <div
                  key={title}
                  className={`rounded-2xl border px-4 py-4 text-center transition ${
                    isActive
                      ? "border-indigo-500 bg-indigo-50 shadow-sm"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {stepIndex}
                  </div>
                  <p className={`text-sm font-semibold ${isActive ? "text-indigo-700" : "text-gray-600"}`}>
                    {title}
                  </p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {currentStep === 1 && (
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Policy Verification</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your policy number and fetch the policy before you continue.
                </p>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Policy Number *
                    </label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={(e) => {
                        setPolicyNumber(e.target.value);
                        setPolicyLookupError(null);
                        setValidationErrors((prev) => ({
                          ...prev,
                          policy: null,
                        }));
                      }}
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter your policy number"
                    />
                    {(validationErrors.policy || policyLookupError) && (
                      <p className="mt-2 text-sm text-red-600">
                        {policyLookupError || validationErrors.policy}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePolicyLookup}
                    disabled={policyLookupLoading}
                    className="inline-flex h-fit items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {policyLookupLoading ? "Fetching..." : "Fetch Policy"}
                  </button>
                </div>

                {selectedPolicy ? (
                  <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Policy Loaded</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {selectedPolicy.policyNumber}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                          selectedPolicy.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedPolicy.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Policy Type</p>
                        <p className="mt-2 font-semibold text-gray-900">
                          {selectedPolicy.policyType || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Customer ID</p>
                        <p className="mt-2 font-semibold text-gray-900">
                          {selectedPolicy.customerId || "N/A"}
                        </p>
                      </div>
                    </div>

                    {selectedPolicy.status !== "ACTIVE" && (
                      <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                        This policy is not active. You must use an ACTIVE policy to submit a claim.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Fetch your policy to continue to the next step.
                  </p>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Claim Details</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Add the claim type, incident date, amount, and description.
                </p>

                <div className="mt-6 grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Claim Type *
                    </label>
                    <select
                      name="claimType"
                      value={formData.claimType}
                      onChange={handleFormChange}
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">-- Select Claim Type --</option>
                      <option value="Death">Death Claim</option>
                      <option value="Maturity">Maturity Claim</option>
                    </select>
                    {validationErrors.claimType && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.claimType}</p>
                    )}
                  </div>

                  {formData.claimType === "Death" && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="isAccidentalDeath"
                          checked={formData.isAccidentalDeath}
                          onChange={handleFormChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Was the death accidental?
                      </label>
                    </div>
                  )}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Incident Date *
                      </label>
                      <input
                        type="date"
                        name="incidentDate"
                        value={formData.incidentDate}
                        onChange={handleFormChange}
                        className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      {validationErrors.incidentDate && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.incidentDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Claim Amount *
                      </label>
                      <input
                        type="number"
                        name="claimAmount"
                        value={formData.claimAmount}
                        onChange={handleFormChange}
                        placeholder="Enter amount"
                        className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      {validationErrors.claimAmount && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.claimAmount}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.claimType === "Death"
                        ? "Details about the death *"
                        : formData.claimType === "Maturity"
                        ? "Additional information *"
                        : "Description *"}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={5}
                      placeholder="Describe the claim details"
                      className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    {validationErrors.description && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                </div>

                {formData.claimType && (
                  <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5">
                    <p className="text-sm font-semibold text-green-800">
                      Required documents for {formData.claimType} claim
                    </p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-sm font-medium text-gray-700">Mandatory</p>
                        <ul className="mt-3 space-y-2 text-sm text-gray-600">
                          {mandatory.map((doc, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-800 text-xs">
                                ✓
                              </span>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {conditional.length > 0 && (
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-sm font-medium text-gray-700">Conditional</p>
                          <ul className="mt-3 space-y-2 text-sm text-gray-600">
                            {conditional.map((doc, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs">
                                  !
                                </span>
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Attach at least one supporting document for your claim.
                </p>

                <div className="mt-6 rounded-3xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition hover:border-indigo-500">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    Upload files
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-4 text-sm text-gray-500">
                    Attach PDF, DOC, DOCX or image files. Max size 5MB per file.
                  </p>
                </div>

                {validationErrors.documents && (
                  <p className="mt-3 text-sm text-red-600">{validationErrors.documents}</p>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-semibold text-gray-700">
                      Uploaded files ({uploadedFiles.length})
                    </p>
                    <div className="mt-4 space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
                        >
                          <div className="text-sm text-gray-700">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Confirm the details below before submitting your claim.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Policy</p>
                    <p className="mt-2 text-gray-900">
                      {selectedPolicy?.policyNumber || policyNumber}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Claim Summary</p>
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Type:</span> {formData.claimType || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Date:</span> {formData.incidentDate}
                      </p>
                      <p>
                        <span className="font-semibold">Amount:</span> ₹{formData.claimAmount || "0"}
                      </p>
                      <p>
                        <span className="font-semibold">Description:</span>{" "}
                        {formData.description || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Documents</p>
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      {uploadedFiles.length > 0 ? (
                        uploadedFiles.map((file, index) => <p key={index}>{file.name}</p>)
                      ) : (
                        <p>No files attached yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                      submitting
                        ? "bg-indigo-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Claim"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartClaim;
