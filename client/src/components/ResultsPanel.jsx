import React from 'react';
import { motion } from 'framer-motion';
import History from './History';
import ChatInterface from './ChatInterface'; // Import the new component

function ResultsPanel({
  user,
  summary,
  summariesHistory,
  isHistoryLoading,
  showHistory, setShowHistory,
  searchTerm, setSearchTerm,
  handleSelectSummaryFromHistory,
  handleRenameSummary,
  // Add all the props that ChatInterface will need
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
    <div className="lg:w-1/3 w-full bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">{showHistory ? 'History' : 'Generated Summary'}</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
          disabled={!summary && !showHistory}
        >
          {showHistory ? (summary ? 'Show Summary' : '') : 'Show History'}
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
            {/* --- CORRECTED: Pass all necessary props down to ChatInterface --- */}
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
          <div className="text-center p-4 bg-slate-50/70 rounded-lg">
            <p className="text-slate-500">Your new summary will appear here after generation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPanel;
