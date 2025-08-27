import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Layout() {
  return (
    // The only change is the background color for a cleaner, more modern feel.
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
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
