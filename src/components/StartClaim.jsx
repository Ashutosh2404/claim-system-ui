import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const StartClaim = () => {
  const { policyId } = useParams();
  const [userId, setUserId] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(policyId || '');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    claimType: '',
    incidentDate: getTodayDate(),
    description: '',
    isAccidentalDeath: false
  });

  // Get today's date in YYYY-MM-DD format
  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get required documents based on claim type (Life Insurance only)
  const getRequiredDocuments = (claimType, isAccidental = false) => {
    if (claimType === 'Death') {
      const mandatory = [
        'Death Certificate',
        'Claimant Statement Form',
        'ID Proof',
        'Address Proof',
        'PAN Card',
        'Bank Proof',
        'Claimant Photograph'
      ];

      const conditional = [];
      if (isAccidental) {
        conditional.push('FIR Report', 'Postmortem Report');
      }

      return { mandatory, conditional };
    } else if (claimType === 'Maturity') {
      return {
        mandatory: [
          'Policy Document / Policy Number',
          'ID Proof',
          'PAN Card',
          'Bank Proof'
        ],
        conditional: []
      };
    }
    return { mandatory: [], conditional: [] };
  };

  // Mock data for fallback
  const mockPolicies = [
    {
      id: 1,
      policyNumber: 'POL-2024-001',
      policyType: 'Life Insurance',
      status: 'Active',
      premium: 5000,
      nextDueDate: '2024-05-15'
    },
    {
      id: 2,
      policyNumber: 'POL-2024-002',
      policyType: 'Health Insurance',
      status: 'Active',
      premium: 3000,
      nextDueDate: '2024-05-20'
    },
    {
      id: 3,
      policyNumber: 'POL-2023-005',
      policyType: 'Accident Insurance',
      status: 'Lapsed',
      premium: 1500,
      nextDueDate: '2024-02-10'
    }
  ];

  // Fetch user profile first
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        
        if (response.ok) {
          const userData = await response.json();
          setUserId(userData.userId);
        } else {
          setUserId(1); // Default fallback
          setError('Unable to fetch user profile. Using default user.');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUserId(1);
        setError('Connection failed. Using default data.');
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch policies after userId is obtained
  useEffect(() => {
    if (!userId) return;

    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/policies?userId=${userId}`);

        if (response.ok) {
          const policiesData = await response.json();
          setPolicies(policiesData);
          
          // Auto-select policy if policyId provided
          if (policyId) {
            setSelectedPolicyId(policyId);
          }
        } else {
          setPolicies(mockPolicies);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching policies:', err);
        setPolicies(mockPolicies);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [userId, policyId]);

  // Update selected policy when selectedPolicyId changes
  useEffect(() => {
    if (selectedPolicyId && policies.length > 0) {
      const policy = policies.find(p => p.id == selectedPolicyId);
      setSelectedPolicy(policy || null);

      // Auto-select claim type based on policy type
      if (policy && policy.policyType === 'Life Insurance') {
        setFormData(prev => ({
          ...prev,
          claimType: 'Death'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          claimType: ''
        }));
      }
    } else {
      setSelectedPolicy(null);
    }
  }, [selectedPolicyId, policies]);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds 5MB limit.`);
        return false;
      }
      return true;
    });

    setUploadedFiles([...uploadedFiles, ...validFiles]);
  };

  // Remove file from uploaded list
  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!selectedPolicyId) {
      errors.policy = 'Please select a policy';
    } else if (selectedPolicy && selectedPolicy.status !== 'Active') {
      errors.policy = `Cannot claim on ${selectedPolicy.status} policy. Please select an Active policy.`;
    }
    if (!formData.claimType) {
      errors.claimType = 'Please select a claim type';
    }
    if (!formData.incidentDate) {
      errors.incidentDate = 'Please enter incident date';
    }
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Please enter a description';
    }

    // Validate mandatory documents upload
    if (formData.claimType) {
      const { mandatory } = getRequiredDocuments(formData.claimType, formData.isAccidentalDeath);
      if (uploadedFiles.length === 0) {
        errors.documents = `Please upload at least one document. Mandatory documents: ${mandatory.join(', ')}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare payload with enhanced data
      const payload = {
        policyId: selectedPolicyId,
        claimType: formData.claimType,
        incidentDate: formData.incidentDate,
        description: formData.description,
        isAccidentalDeath: formData.claimType === 'Death' ? formData.isAccidentalDeath : null,
        userId: userId,
        createdAt: new Date().toISOString(),
        status: 'Submitted'
      };

      const response = await fetch('/api/claims/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/claimservice/claims';
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create claim. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>✓ Claim Submitted Successfully!</h2>
          <p style={styles.successMessage}>Your claim has been created. You will be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.pageTitle}>Start a New Claim</h1>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Policy Selection Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Select Policy</h2>

            {!policyId && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Select a Policy *</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: validationErrors.policy ? '#dc2626' : '#d1d5db'
                  }}
                >
                  <option value="">-- Choose a Policy --</option>
                  {policies.map(policy => (
                    <option key={policy.id} value={policy.id}>
                      {policy.policyNumber} - {policy.policyType}
                    </option>
                  ))}
                </select>
                {validationErrors.policy && (
                  <p style={styles.errorText}>{validationErrors.policy}</p>
                )}
              </div>
            )}

            {/* Selected Policy Details */}
            {selectedPolicy && (
              <div style={{
                ...styles.policyDetailsBox,
                borderColor: selectedPolicy.status !== 'Active' ? '#fee2e2' : '#d1d5db',
                backgroundColor: selectedPolicy.status !== 'Active' ? '#fef2f2' : '#f3f4f6'
              }}>
                <h3 style={styles.detailsTitle}>Policy Information</h3>
                <div style={styles.detailsGrid}>
                  <div>
                    <p style={styles.detailLabel}>Policy Number</p>
                    <p style={styles.detailValue}>{selectedPolicy.policyNumber}</p>
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Policy Type</p>
                    <p style={styles.detailValue}>{selectedPolicy.policyType}</p>
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Status</p>
                    <p style={{
                      ...styles.detailValue,
                      color: selectedPolicy.status === 'Active' ? '#10b981' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {selectedPolicy.status}
                    </p>
                  </div>
                </div>
                
                {selectedPolicy.status !== 'Active' && (
                  <p style={styles.inactiveWarning}>
                    ⚠️ This policy is {selectedPolicy.status}. Claims cannot be filed on inactive policies.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Claim Details Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Claim Details</h2>

            {/* Claim Type */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Claim Type * (Life Insurance Only)</label>
              <select
                name="claimType"
                value={formData.claimType}
                onChange={handleFormChange}
                style={{
                  ...styles.input,
                  borderColor: validationErrors.claimType ? '#dc2626' : '#d1d5db'
                }}
              >
                <option value="">-- Select Claim Type --</option>
                <option value="Death">Death Claim</option>
                <option value="Maturity">Maturity Claim</option>
              </select>
              {validationErrors.claimType && (
                <p style={styles.errorText}>{validationErrors.claimType}</p>
              )}

              {/* Accidental Death Question */}
              {formData.claimType === 'Death' && (
                <div style={styles.conditionalQuestion}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isAccidentalDeath"
                      checked={formData.isAccidentalDeath}
                      onChange={handleFormChange}
                    />
                    <span style={{ marginLeft: '8px' }}>Was the death accidental?</span>
                  </label>
                </div>
              )}

              {/* Required Documents */}
              {formData.claimType && (
                <div style={styles.requiredDocsBox}>
                  <p style={styles.requiredDocsTitle}>Mandatory Documents:</p>
                  <ul style={styles.ul}>
                    {getRequiredDocuments(formData.claimType, formData.isAccidentalDeath).mandatory.map((doc, idx) => (
                      <li key={idx} style={styles.docLi}>✓ {doc}</li>
                    ))}
                  </ul>
                  
                  {getRequiredDocuments(formData.claimType, formData.isAccidentalDeath).conditional.length > 0 && (
                    <>
                      <p style={styles.requiredDocsTitle}>Additional Required Documents (Based on your response):</p>
                      <ul style={styles.ul}>
                        {getRequiredDocuments(formData.claimType, formData.isAccidentalDeath).conditional.map((doc, idx) => (
                          <li key={idx} style={styles.conditionalDocLi}>⚠️ {doc}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Incident Date - Only for Death Claims */}
            {formData.claimType === 'Death' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Death *</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleFormChange}
                  style={{
                    ...styles.input,
                    borderColor: validationErrors.incidentDate ? '#dc2626' : '#d1d5db'
                  }}
                />
                {validationErrors.incidentDate && (
                  <p style={styles.errorText}>{validationErrors.incidentDate}</p>
                )}
              </div>
            )}

            {/* Maturity Date - Only for Maturity Claims */}
            {formData.claimType === 'Maturity' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Policy Maturity Date *</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleFormChange}
                  style={{
                    ...styles.input,
                    borderColor: validationErrors.incidentDate ? '#dc2626' : '#d1d5db'
                  }}
                />
                {validationErrors.incidentDate && (
                  <p style={styles.errorText}>{validationErrors.incidentDate}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {formData.claimType === 'Death' ? 'Details about the death *' : 
                 formData.claimType === 'Maturity' ? 'Additional information *' : 'Description *'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder={
                  formData.claimType === 'Death' 
                    ? 'Provide details about the death (date, place, circumstances)...' 
                    : formData.claimType === 'Maturity'
                    ? 'Provide maturity claim details...'
                    : 'Provide details...'
                }
                rows="5"
                style={{
                  ...styles.textarea,
                  borderColor: validationErrors.description ? '#dc2626' : '#d1d5db'
                }}
              />
              {validationErrors.description && (
                <p style={styles.errorText}>{validationErrors.description}</p>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Upload Documents (Mandatory)</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Supporting Documents *</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{
                  ...styles.fileInput,
                  borderColor: validationErrors.documents ? '#dc2626' : '#3b82f6'
                }}
                accept="image/*,.pdf,.doc,.docx"
              />
              <p style={styles.helperText}>Supported formats: PDF, DOC, DOCX, Images | Max size: 5MB per file</p>
              
              {validationErrors.documents && (
                <p style={styles.errorAlert}>{validationErrors.documents}</p>
              )}
              
              {uploadedFiles.length > 0 && (
                <div style={styles.fileList}>
                  <p style={styles.fileListTitle}>Uploaded Files ({uploadedFiles.length}):</p>
                  <ul style={styles.ul}>
                    {uploadedFiles.map((file, idx) => (
                      <li key={idx} style={styles.fileListItem}>
                        <span>📎 {file.name} ({formatFileSize(file.size)})</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          style={styles.removeFileBtn}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={
                submitting || 
                !selectedPolicy || 
                selectedPolicy.status !== 'Active' ||
                Object.keys(validationErrors).length > 0
              }
              style={{
                ...styles.submitButton,
                opacity: (
                  submitting || 
                  !selectedPolicy || 
                  selectedPolicy.status !== 'Active' ||
                  Object.keys(validationErrors).length > 0
                ) ? 0.5 : 1,
                cursor: (
                  submitting || 
                  !selectedPolicy || 
                  selectedPolicy.status !== 'Active' ||
                  Object.keys(validationErrors).length > 0
                ) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/claimservice/dashboard'}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  pageTitle: {
    fontSize: '28px',
    margin: '0 0 30px 0',
    color: '#1f2937'
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    borderLeft: '4px solid #dc2626',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  successCard: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center'
  },
  successTitle: {
    color: '#047857',
    fontSize: '24px',
    margin: '0 0 10px 0'
  },
  successMessage: {
    color: '#059669',
    fontSize: '16px',
    margin: 0
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 20px 0'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#374151',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  fileInput: {
    padding: '8px',
    border: '2px dashed #3b82f6',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box'
  },
  helperText: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '5px'
  },
  fileList: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px'
  },
  fileListTitle: {
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    fontSize: '14px'
  },
  fileListItem: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '1px solid #e5e7eb'
  },
  removeFileBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '0 4px'
  },
  requiredDocsBox: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px'
  },
  requiredDocsTitle: {
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#166534'
  },
  docLi: {
    fontSize: '14px',
    color: '#166534',
    marginBottom: '5px'
  },
  autoFillHint: {
    fontSize: '12px',
    color: '#10b981',
    fontStyle: 'italic',
    fontWeight: 'normal'
  },
  inactiveWarning: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '4px',
    fontSize: '14px',
    margin: '12px 0 0 0'
  },
  ul: {
    margin: '0',
    paddingLeft: '20px'
  },
  li: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '5px'
  },
  errorText: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '5px',
    margin: '5px 0 0 0'
  },
  policyDetailsBox: {
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '16px',
    marginTop: '15px'
  },
  detailsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    color: '#1f2937'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px'
  },
  detailLabel: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0 0 4px 0'
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  submitButton: {
    padding: '12px 32px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  cancelButton: {
    padding: '12px 32px',
    backgroundColor: '#e5e7eb',
    color: '#1f2937',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '16px',
    padding: '40px'
  },
  conditionalQuestion: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: '6px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#1f2937',
    cursor: 'pointer',
    userSelect: 'none'
  },
  conditionalDocLi: {
    fontSize: '14px',
    color: '#b45309',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  errorAlert: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    marginTop: '8px',
    border: '1px solid #fecaca'
  }
};

export default StartClaim;
