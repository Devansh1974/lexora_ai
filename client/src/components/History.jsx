import React from 'react';
import { motion } from 'framer-motion'; // Import for animations

function History({ summaries, onSelectSummary }) {
  if (!summaries.length) {
    return (
      <div className="text-center p-4 bg-slate-50 rounded-lg">
        <p className="text-slate-500">Your generated summaries will appear here.</p>
      </div>
    );
  }

  // Animation variants for the container to stagger children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
          whileHover={{ scale: 1.03, zIndex: 10 }} // Lift effect on hover
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
