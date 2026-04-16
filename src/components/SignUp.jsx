import React, { useState } from 'react';
import '../styles/Login-Style.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    userType: 'policyholder',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    nationalIdType: 'aadhaar',
    nationalId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    
    relationship: '',
    policyNumber: '',
    gender: '',
    dateOfBirth: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Sign Up Data:', formData);
    // Handle sign up logic here
  };

  return (
    <div className="login-card">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        {/* User Type Selection */}
        <div className="input-group">
          <label style={{ marginBottom: '8px', fontWeight: 'bold' }}>Account Type:</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="radio" 
                name="userType"
                value="policyholder"
                checked={formData.userType === 'policyholder'}
                onChange={handleChange}
              />
              Policy Holder
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="radio" 
                name="userType"
                value="nominee"
                checked={formData.userType === 'nominee'}
                onChange={handleChange}
              />
              Nominee/Claimant
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="input-group">
          <input 
            type="text" 
            name="fullName"
            placeholder="Full Name" 
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input 
            type="email" 
            name="email"
            placeholder="Email Address" 
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input 
            type="tel" 
            name="mobileNumber"
            placeholder="Mobile Number" 
            value={formData.mobileNumber}
            onChange={handleChange}
            pattern="[0-9]{10}"
            required
          />
        </div>

        {/* Gender */}
        <div className="input-group">
          <select 
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div className="input-group">
          <input 
            type="date" 
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        {/* National ID */}
        <div className="input-group">
          <label style={{ marginBottom: '8px', fontWeight: 'bold' }}>National ID Type:</label>
          <select 
            name="nationalIdType"
            value={formData.nationalIdType}
            onChange={handleChange}
            required
          >
            <option value="aadhaar">Aadhaar Card</option>
            <option value="pancard">PAN Card</option>
            <option value="votercard">Voter Card</option>
          </select>
        </div>

        <div className="input-group">
          <input 
            type="text" 
            name="nationalId"
            placeholder={`Enter ${formData.nationalIdType === 'aadhaar' ? 'Aadhaar' : formData.nationalIdType === 'pancard' ? 'PAN' : 'Voter'} Number`}
            value={formData.nationalId}
            onChange={handleChange}
            required
          />
        </div>

        {/* Residential Address */}
        <div className="input-group">
          <input 
            type="text" 
            name="addressLine1"
            placeholder="Address Line 1" 
            value={formData.addressLine1}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input 
            type="text" 
            name="addressLine2"
            placeholder="Address Line 2 (Optional)" 
            value={formData.addressLine2}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <input 
            type="text" 
            name="city"
            placeholder="City" 
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input 
            type="text" 
            name="state"
            placeholder="State" 
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input 
            type="text" 
            name="zipCode"
            placeholder="Zip Code" 
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
        </div>

        

        {/* Relationship with Policy Holder */}
        {formData.userType === 'nominee' && (
          <div className="input-group">
            <select 
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              required
            >
              <option value="">Select Relationship with Policy Holder</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Policy Number - Only for Nominee/Claimant */}
        {formData.userType === 'nominee' && (
          <div className="input-group">
            <input 
              type="text" 
              name="policyNumber"
              placeholder="Policy Number" 
              value={formData.policyNumber}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Password */}
        <div className="input-group">
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="Confirm Password" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Sign Up
        </button>
      </form>
      <div className="links-container">
        <a href="/claimservice/login" className="forgot-password-link">Already have an account? Login</a>
      </div>
    </div>
  );
};

export default SignUp;
