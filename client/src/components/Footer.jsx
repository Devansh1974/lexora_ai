import React from 'react';
import { Github } from 'lucide-react'; // Added Github icon

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900/50 backdrop-blur-lg border-t border-slate-700/50">
      {/* --- CORRECTED: Removed max-w-7xl for full-width layout --- */}
      <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Left Section: Logo and Tagline */}
          <div className="text-center md:text-left">
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              LexoraAI
            </span>
            <p className="mt-1 text-sm text-slate-400">
              Clarity from conversation.
            </p>
          </div>

          {/* Center Section: Copyright */}
          <div className="text-center text-base text-slate-400">
             <p>&copy; {currentYear} Made by Devansh Singh</p>
          </div>
          
          {/* Right Section: Social Links */}
          <div className="flex space-x-6">
            <a href="mailto:devanshsingh1974@gmail.com" className="text-slate-400 hover:text-white transition">
              <span className="sr-only">Email</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/devanshsingh2006/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/>
              </svg>
            </a>
            <a href="https://github.com/Devansh1974" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
