import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import LiveIndexes from './LiveIndexes';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <Router>
    {/* Live Index Prices always visible at the top */}
    <LiveIndexes />
    <Routes>
      <Route path="/*" element={<App />} />
    </Routes>
  </Router>
);
