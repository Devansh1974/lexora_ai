import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SharedSummary from './SharedSummary.jsx';
import Layout from './components/Layout.jsx';
import { AuthProvider } from './AuthContext.jsx'; // Import the AuthProvider
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider wraps the entire application to provide user context */}
    <AuthProvider>
      <Router>
        <Routes>
          {/* The Layout component adds the Header and Footer to every page */}
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/summary/:shareId" element={<SharedSummary />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
