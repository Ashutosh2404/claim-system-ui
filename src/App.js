import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import StartClaim from './components/StartClaim';

function App() {
  return (
    <Router basename="/claimservice">
      <div className="App">
        {/* <h1 style={{ textAlign: 'center' }}>Dissertation Project UI</h1> */}
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/claim/start" element={<StartClaim />} />
          <Route path="/claim/start/:policyId" element={<StartClaim />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;