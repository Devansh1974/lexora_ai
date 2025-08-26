import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SharedSummary from './SharedSummary.jsx';
import Layout from './components/Layout.jsx'; // Import the layout
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* All routes are now children of the Layout component */}
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/summary/:shareId" element={<SharedSummary />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
