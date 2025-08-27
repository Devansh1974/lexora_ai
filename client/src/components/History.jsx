import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Check } from 'lucide-react'; // Added new icons

// A new component for the animated loading skeleton placeholder
const SkeletonItem = () => (
  <div className="p-4 border border-slate-200 rounded-lg animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-full mb-3"></div>
    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
  </div>
);

function History({ 
  summaries, 
  onSelectSummary, 
  isLoading, 
  searchTerm, // New prop for search
  setSearchTerm, // New prop for search
  handleRenameSummary // New prop for renaming
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

  // First, handle the loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    );
  }

  // Filter summaries based on the search term
  const filteredSummaries = summaries.filter(summary =>
    summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.summaryText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Next, handle the improved empty state
  if (!summaries.length) {
    return (
      <div className="text-center p-8 bg-slate-50/70 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-700">Ready to Start?</h3>
        <p className="text-slate-500 mt-1 text-sm">Generate your first summary to see your history populate here!</p>
      </div>
    );
  }

  const containerVariants = { /* ... same as before ... */ };
  const itemVariants = { /* ... same as before ... */ };

  return (
    <div className="flex flex-col h-full">
      {/* --- NEW: Search Bar --- */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* --- Updated History List --- */}
      <motion.div
        className="space-y-3 overflow-y-auto flex-grow"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredSummaries.length > 0 ? (
          filteredSummaries.map((summary) => (
            <motion.div
              key={summary._id}
              className="p-4 border border-slate-200 rounded-lg cursor-pointer transition-shadow duration-200 hover:shadow-md hover:bg-slate-50"
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
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave(summary._id)}
                    className="flex-grow font-semibold text-slate-800 bg-transparent border-b border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => handleTitleSave(summary._id)} className="ml-2 p-1 text-green-600 hover:bg-green-100 rounded-full">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <p onClick={() => onSelectSummary(summary)} className="font-semibold text-slate-800 truncate flex-grow">
                    {summary.title}
                  </p>
                  <button onClick={() => handleEditClick(summary)} className="ml-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p onClick={() => onSelectSummary(summary)} className="text-sm text-slate-500 truncate mt-1">{summary.summaryText}</p>
              <p onClick={() => onSelectSummary(summary)} className="text-xs text-slate-400 mt-2">{new Date(summary.createdAt).toLocaleString()}</p>
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
