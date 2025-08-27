import React from 'react';
import { motion } from 'framer-motion';

// A new component for the animated loading skeleton placeholder
const SkeletonItem = () => (
  <div className="p-4 border border-slate-200 rounded-lg animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-full mb-3"></div>
    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
  </div>
);

function History({ summaries, onSelectSummary, isLoading }) { // Added isLoading prop
  
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

  // Next, handle the improved empty state
  if (!summaries.length) {
    return (
      <div className="text-center p-8 bg-slate-50/70 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-700">Ready to Start?</h3>
        <p className="text-slate-500 mt-1 text-sm">Generate your first summary to see your history populate here!</p>
      </div>
    );
  }

  // Animation variants for the container to stagger children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  // Animation variants for each list item
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {summaries.map((summary) => (
        <motion.div
          key={summary._id}
          onClick={() => onSelectSummary(summary)}
          className="p-4 border border-slate-200 rounded-lg cursor-pointer transition-shadow duration-200 hover:shadow-md hover:bg-slate-50"
          variants={itemVariants}
          whileHover={{ scale: 1.03, zIndex: 10 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-semibold text-slate-800 truncate">{summary.prompt}</p>
          <p className="text-sm text-slate-500 truncate mt-1">{summary.summaryText}</p>
          <p className="text-xs text-slate-400 mt-2">{new Date(summary.createdAt).toLocaleString()}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default History;
