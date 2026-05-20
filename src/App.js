import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import StartClaim from './components/StartClaim';
import OfficerClaimDetail from './components/OfficerClaimDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router basename="/claimservice">
      <div className="App">
        {/* <h1 style={{ textAlign: 'center' }}>Dissertation Project UI</h1> */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claim/start"
            element={
              <ProtectedRoute>
                <StartClaim />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claim/start/:policyId"
            element={
              <ProtectedRoute>
                <StartClaim />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officerDashboard"
            element={
              <ProtectedRoute>
                <OfficerClaimDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;