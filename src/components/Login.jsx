import React, { useState } from 'react';
import '../styles/Login-Style.css'; // This connects the two files!

const Login = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="login-card">
      <h2>Login</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="input-group">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <input type="password" placeholder="Password" />
        </div>
        <button type="submit" className="login-button">
          Sign In
        </button>
      </form>
      <div className="links-container">
        <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
        <a href="/claimservice/signup" className="signup-link">New User? Let's Sign Up</a>
      </div>
    </div>
  );
};

export default Login;