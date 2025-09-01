import React from 'react';
import { motion } from 'framer-motion';
import History from './History';
import ChatInterface from './ChatInterface';

function ResultsPanel({
  user,
  summary,
  summariesHistory,
  isHistoryLoading,
  showHistory, setShowHistory,
  searchTerm, setSearchTerm,
  handleSelectSummaryFromHistory,
  handleRenameSummary,
  handleRefineSummary,
  handleSaveChanges,
  isRefining,
  handleCopyToClipboard,
  handleExport,
  handleShareEmail,
  recipient, 
  setRecipient
}) {

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-100">{showHistory ? 'History' : 'Generated Summary'}</h2>
        {/* --- CORRECTED BUTTON LOGIC --- */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm font-semibold text-blue-400 hover:underline disabled:text-slate-500 disabled:no-underline disabled:cursor-not-allowed"
          // The button is disabled only if you're trying to view a summary that doesn't exist yet.
          disabled={showHistory && !summary}
        >
          {showHistory ? 'Show Summary' : 'Show History'}
        </button>
      </div>
      
      <div className="flex-grow overflow-hidden">
        {showHistory ? (
          <History 
            summaries={summariesHistory} 
            onSelectSummary={handleSelectSummaryFromHistory}
            isLoading={isHistoryLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleRenameSummary={handleRenameSummary}
          />
        ) : summary ? (
          <motion.div className="h-full" initial={{opacity: 0}} animate={{opacity: 1}}>
            <ChatInterface 
              user={user}
              summary={summary}
              handleRefineSummary={handleRefineSummary}
              handleSaveChanges={handleSaveChanges}
              isRefining={isRefining}
              handleCopyToClipboard={handleCopyToClipboard}
              handleExport={handleExport}
              handleShareEmail={handleShareEmail}
              recipient={recipient}
              setRecipient={setRecipient}
            />
          </motion.div>
        ) : (
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <p className="text-slate-400">Your new summary will appear here after generation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPanel;

