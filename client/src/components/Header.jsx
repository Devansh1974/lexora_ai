import React from 'react';
import { useAuth } from '../AuthContext'; // Import the custom hook to get user info

function Header() {
  const { user } = useAuth(); // Get the current user from the context

  // This function decides what to show based on login status
  const renderAuthContent = () => {
    if (user) {
      // If the user is logged in, show their info and a logout button
      return (
        <div className="flex items-center space-x-4">
          <img src={user.photo} alt={user.displayName} className="h-10 w-10 rounded-full" />
          <span className="text-gray-700 font-medium hidden sm:block">{user.displayName}</span>
          <a href="http://localhost:5001/api/logout" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition">
            Logout
          </a>
        </div>
      );
    } else {
      // If the user is not logged in, show the login button
      return (
        <a href="http://localhost:5001/auth/google" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
          Login with Google
        </a>
      );
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-2xl font-bold text-gray-800">LexoraAI</span>
          </div>
          <nav>
            {renderAuthContent()}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
