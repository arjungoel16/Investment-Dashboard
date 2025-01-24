import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import App.css
import './App.css';
import Dashboard from './pages/Dashboard';
import GraphAnalysis from './services/graphAnalysis';
import Forex from './services/forex';
import News from './services/news';
import AboutUs from './services/AboutUs';
import EmailVerification from './pages/emailVerification';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/graph-analysis" element={<GraphAnalysis />} />
        <Route path="/forex" element={<Forex />} />
        <Route path="/news/global" element={<News type="global" />} />
        <Route path="/news/us" element={<News type="us" />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/verify" element={<EmailVerification />} />
      </Routes>
    </Router>
  );
}

export default App;
