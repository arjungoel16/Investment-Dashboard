import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Main App Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/news/global" element={<News type="global" />} />
        <Route path="/news/us" element={<News type="us" />} />
        <Route path="/etfs-futures" element={<EtfsFutures />} />
        <Route path="/forex" element={<Forex />} />
      </Routes>
    </Router>
  );
}

export default App;
