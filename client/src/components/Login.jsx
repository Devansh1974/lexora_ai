import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Share2, MessageSquare } from 'lucide-react'; // Icons for the feature list

// A simple, inline SVG component for the Google G logo
const GoogleIcon = () => (
  <svg className="h-6 w-6 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

const Feature = ({ icon, title, children }) => (
  <motion.div 
    className="flex items-start space-x-4"
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
  >
    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-slate-400">{children}</p>
    </div>
  </motion.div>
);

function Login() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Text Content */}
        <motion.div 
          className="text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl lg:text-6xl font-bold text-white tracking-tight"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Turn Messy Notes into <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Actionable Insights</span>
          </motion.h1>

          <motion.p 
            className="mt-6 text-lg text-slate-300 max-w-xl mx-auto lg:mx-0"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            LexoraAI is your intelligent assistant for meeting summaries. Upload any transcript, provide an instruction, and get a perfectly formatted summary in seconds.
          </motion.p>

          <motion.div 
            className="mt-10 space-y-8"
            variants={containerVariants} // This will stagger the children inside
          >
            <Feature icon={<FileText className="h-6 w-6 text-blue-400" />} title="Instant Summaries">
              From long transcripts to concise bullet points, executive summaries, or action items.
            </Feature>
            <Feature icon={<MessageSquare className="h-6 w-6 text-purple-400" />} title="Conversational Editing">
              Refine your summary with simple chat commands. Ask the AI to make it shorter, change the tone, or focus on key topics.
            </Feature>
            <Feature icon={<Share2 className="h-6 w-6 text-green-400" />} title="Share & Collaborate">
              Share your insights with a public link or send summaries directly from your own email account.
            </Feature>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ delay: 1.0 }} // A longer delay for the final button
          >
            <motion.a
              href="http://localhost:5001/auth/google"
              className="mt-12 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-transparent text-slate-800 font-bold py-3 px-8 rounded-lg transition duration-200 shadow-lg text-lg"
              whileHover={{ scale: 1.05, boxShadow: '0px 0px 30px rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <GoogleIcon />
              Get Started with Google
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Right Column: Visual */}
        <motion.div 
          className="hidden lg:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <img 
            src="https://placehold.co/600x600/0f172a/6366F1?text=AI&font=raleway" 
            alt="Abstract AI visualization"
            className="rounded-2xl shadow-2xl"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x600/0f172a/FFFFFF?text=LexoraAI'; }}
          />
        </motion.div>

      </div>
    </div>
  );
}

export default Login;
