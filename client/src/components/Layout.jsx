import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Layout() {
  return (
    // Removed the background color class to allow the body's dark theme to show through.
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* The Outlet will render the current page component (e.g., App or SharedSummary) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
