import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Check } from 'lucide-react';

// A new component for the animated loading skeleton placeholder
const SkeletonItem = () => (
  <div className="p-4 border border-slate-700 rounded-lg animate-pulse">
    <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-slate-600 rounded w-full mb-3"></div>
    <div className="h-2 bg-slate-600 rounded w-1/2"></div>
  </div>
);

function History({
  summaries,
  onSelectSummary,
  isLoading,
  searchTerm,
  setSearchTerm,
  handleRenameSummary
}) {

  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleEditClick = (summary) => {
    setEditingId(summary._id);
    setNewTitle(summary.title);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = (summaryId) => {
    if (newTitle.trim()) {
      handleRenameSummary(summaryId, newTitle);
    }
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    );
  }

  const filteredSummaries = summaries.filter(summary =>
    summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.summaryText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!summaries.length && !searchTerm) {
    return (
      <div className="text-center p-8 bg-slate-900/50 rounded-lg border border-slate-700">
        <h3 className="font-semibold text-slate-200">Ready to Start?</h3>
        <p className="text-slate-400 mt-1 text-sm">Generate your first summary to see your history populate here!</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    // --- CORRECTED: Main container is a flex column to enable scrolling ---
    <div className="flex flex-col h-full">
      <div className="relative mb-4 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* --- CORRECTED: This motion.div is now the scrollable container --- */}
      <motion.div
        className="space-y-3 h-35 overflow-y-scroll flex-grow pr-2 -mr-2" // Added margin trick to hide scrollbar visually
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredSummaries.length > 0 ? (
          filteredSummaries.map((summary) => (
            <motion.div
              key={summary._id}
              className="p-4 border border-slate-700 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-slate-700/50"
              variants={itemVariants}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              transition={{ duration: 0.2 }}
            >
              {editingId === summary._id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={handleTitleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave(summary._id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-grow font-semibold text-slate-100 bg-transparent border-b border-blue-500 focus:outline-none"
                    autoFocus
                    onBlur={() => setEditingId(null)} // Save on blur
                  />
                  <button onClick={() => handleTitleSave(summary._id)} className="ml-2 p-1 text-green-400 hover:bg-green-500/20 rounded-full">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <p onClick={() => onSelectSummary(summary)} className="font-semibold text-slate-200 truncate flex-grow">
                    {summary.title}
                  </p>
                  <button onClick={() => handleEditClick(summary)} className="ml-2 p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p onClick={() => onSelectSummary(summary)} className="text-sm text-slate-400 truncate mt-1">{summary.summaryText}</p>
              <p onClick={() => onSelectSummary(summary)} className="text-xs text-slate-500 mt-2">{new Date(summary.createdAt).toLocaleString()}</p>
            </motion.div>
          ))
        ) : (
          <div className="text-center p-8 text-slate-500">
            <p>No summaries found for "{searchTerm}".</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default History;

