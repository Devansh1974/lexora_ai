import React, { Fragment } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react'; // For the dropdown
import { LogOut } from 'lucide-react'; // Icon for the logout button

// A simple, inline SVG component for the Google G logo
const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

function Header() {
  const { user } = useAuth();

  const renderAuthContent = () => {
    if (user) {
      return (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="sr-only">Open user menu</span>
              <img className="h-10 w-10 rounded-full" src={user.photo} alt={user.displayName} />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                  <p className="truncate text-sm text-gray-500">{user.email}</p>
                </div>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="http://localhost:5001/api/logout"
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      Logout
                    </a>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      );
    } else {
      return (
        <a href="http://localhost:5001/auth/google" className="inline-flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition duration-200 shadow-sm">
          <GoogleIcon />
          Login with Google
        </a>
      );
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-lg shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              LexoraAI
            </span>
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
