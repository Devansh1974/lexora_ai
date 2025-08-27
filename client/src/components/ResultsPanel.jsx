import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Send, Copy } from 'lucide-react'; // Added Copy icon
import ReactMarkdown from 'react-markdown';
import History from './History';

function ResultsPanel({
  user,
  summary,
  summariesHistory,
  showHistory, setShowHistory,
  statusMessage, setStatusMessage, // Added setStatusMessage to props
  recipient, setRecipient,
  handleSelectSummaryFromHistory,
  handleCopyToClipboard,
  handleShareEmail
}) {

  // New function to copy only the summary text
  const handleCopyText = () => {
    if (!summary || !summary.summaryText) return;
    navigator.clipboard.writeText(summary.summaryText).then(() => {
      setStatusMessage('Summary text copied to clipboard!');
      setTimeout(() => setStatusMessage(''), 3000);
    });
  };

  return (
    // Updated main container with glassmorphism effect
    <div className="lg:w-1/3 w-full bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{showHistory ? 'History' : 'Generated Summary'}</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
          disabled={!summary && !showHistory}
        >
          {showHistory ? (summary ? 'Show Summary' : '') : 'Show History'}
        </button>
      </div>
      <AnimatePresence>
        {statusMessage && (
          <motion.p
            key="status-message"
            className="text-center font-semibold text-blue-600 pb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {statusMessage}
          </motion.p>
        )}
      </AnimatePresence>
      {showHistory ? (
        <History summaries={summariesHistory} onSelectSummary={handleSelectSummaryFromHistory} />
      ) : summary ? (
        <motion.div className="space-y-6" initial={{opacity: 0}} animate={{opacity: 1}}>
          <div className="relative group">
            <div className="prose prose-slate max-w-none p-4 bg-slate-50/70 rounded-lg border border-slate-200 h-96 overflow-y-auto">
              <ReactMarkdown>{summary.summaryText}</ReactMarkdown>
            </div>
            <motion.button
              onClick={handleCopyText}
              className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-sm rounded-md text-slate-500 hover:text-slate-800 hover:bg-white transition opacity-0 group-hover:opacity-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Copy summary text"
            >
              <Copy className="h-4 w-4" />
            </motion.button>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCopyToClipboard} className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors shadow-md">
            <Link className="h-5 w-5 mr-2" /> Copy Shareable Link
          </motion.button>
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">Share via Email</h3>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="email"
                placeholder="recipient@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition bg-white/50"
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleShareEmail} className="sm:w-auto w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors shadow-md">
                <Send className="h-5 w-5 mr-2" /> Send
              </motion.button>
            </div>
            <p className="text-xs text-center text-slate-500">
              Sending from: <span className="font-medium">{user.email}</span>
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="text-center p-4 bg-slate-50/70 rounded-lg">
          <p className="text-slate-500">Your new summary will appear here after generation.</p>
        </div>
      )}
    </div>
  );
}

export default ResultsPanel;
