import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from './api'; // Import our custom api instance
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion'; // Import for animations

function SharedSummary() {
  const { shareId } = useParams();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Use our custom api instance for consistency
        const response = await api.get(`/api/summaries/${shareId}`);
        setSummary(response.data);
      } catch (err) {
        setError('Summary not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [shareId]);

  if (loading) {
    return <div className="text-center text-slate-500 p-10">Loading summary...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 font-bold p-10">{error}</div>;
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 20 }} // Start invisible and slightly down
        animate={{ opacity: 1, y: 0 }}   // Animate to visible and original position
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Meeting Summary</h1>
        <p className="text-sm text-slate-500 mb-8">Generated on {new Date(summary.createdAt).toLocaleDateString()}</p>

        {/* Added prose classes from Tailwind typography for better markdown styling */}
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{summary.summaryText}</ReactMarkdown>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-semibold text-slate-700">Original Prompt</h2>
            <p className="mt-3 text-slate-600 italic bg-slate-100 p-4 rounded-md">"{summary.prompt}"</p>
        </div>
      </motion.div>
    </div>
  );
}

export default SharedSummary;
