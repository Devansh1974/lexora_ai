import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FileText, Share2, MessageSquare, Zap } from 'lucide-react';

// A simple, inline SVG component for the Google G logo
const GoogleIcon = () => (
  <svg className="h-6 w-6 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

const FeatureCard = ({ icon, title, children, index }) => (
  <motion.div
    className="bg-slate-800/50 border border-white/10 rounded-xl p-6 text-center"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true, amount: 0.5 }}
  >
    <div className="inline-block p-3 rounded-lg bg-slate-700/50 border border-white/10 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="mt-2 text-slate-400">{children}</p>
  </motion.div>
);


function Login() {
  const { scrollYProgress } = useScroll();
  // Create a parallax effect for the image
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="w-full bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.stockcake.com/public/5/3/5/53591b03-284f-4b4e-b24b-562ca2350bee_large/neural-network-illuminated-stockcake.jpg" 
            alt="Abstract AI visualization"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </motion.div>

        <motion.div 
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
            Turn Messy Notes into <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Actionable Insights</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
            LexoraAI is your intelligent assistant for meeting summaries. Upload any transcript, provide an instruction, and get a perfectly formatted summary in seconds.
          </p>
          <motion.a
            href="http://localhost:5001/auth/google"
            className="mt-10 inline-flex items-center justify-center bg-white text-slate-900 font-bold py-4 px-8 rounded-lg transition duration-200 shadow-lg text-lg group"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0px 0px 40px rgba(99, 102, 241, 0.5)' 
            }}
            whileTap={{ scale: 0.95 }}
          >
            <GoogleIcon />
            Get Started with Google
          </motion.a>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl font-bold tracking-tight">Everything you need, nothing you don't.</h2>
            <p className="mt-4 text-lg text-slate-400">A powerful suite of features designed for clarity and speed.</p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<FileText className="h-8 w-8 text-blue-400" />} title="Instant Summaries" index={0}>
              From long transcripts to concise bullet points, executive summaries, or action items.
            </FeatureCard>
            <FeatureCard icon={<MessageSquare className="h-8 w-8 text-purple-400" />} title="Conversational Editing" index={1}>
              Refine your summary with simple chat commands. Ask the AI to make it shorter, change the tone, or focus on key topics.
            </FeatureCard>
            <FeatureCard icon={<Share2 className="h-8 w-8 text-green-400" />} title="Share & Collaborate" index={2}>
              Share your insights with a public link or send summaries directly from your own email account.
            </FeatureCard>
          </div>
        </div>
      </div>
      
      {/* Final CTA Section */}
      <div className="py-24 px-4 text-center">
         <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl font-bold tracking-tight">Ready to Reclaim Your Time?</h2>
            <p className="mt-4 text-lg text-slate-400">Stop re-reading. Start understanding.</p>
            <motion.a
              href="http://localhost:5001/auth/google"
              className="mt-10 inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-8 rounded-lg transition duration-200 shadow-lg text-lg group"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0px 0px 40px rgba(99, 102, 241, 0.7)' 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-6 w-6 mr-3" />
              Start Summarizing for Free
            </motion.a>
          </motion.div>
      </div>
    </div>
  );
}

export default Login;
