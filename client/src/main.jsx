// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SharedSummary from './SharedSummary.jsx';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/summary/:shareId" element={<SharedSummary />} />
      </Routes>
    </Router>
  </React.StrictMode>
);