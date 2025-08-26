// src/SharedSummary.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function SharedSummary() {
  const { shareId } = useParams();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/summaries/${shareId}`);
        setSummary(response.data);
      } catch (err) {
        setError('Summary not found or an error occurred.');
      }
    };
    fetchSummary();
  }, [shareId]);

  if (error) {
    return <div className="text-center text-red-500 font-bold p-10">{error}</div>;
  }

  if (!summary) {
    return <div className="text-center text-gray-500 p-10">Loading summary...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Meeting Summary</h1>
        <p className="text-sm text-gray-500 mb-6">Generated on {new Date(summary.createdAt).toLocaleDateString()}</p>

        <div className="prose max-w-none">
          <ReactMarkdown>{summary.summaryText}</ReactMarkdown>
        </div>

        <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-700">Original Prompt</h2>
            <p className="mt-2 text-gray-600 italic bg-gray-100 p-3 rounded-md">"{summary.prompt}"</p>
        </div>
      </div>
    </div>
  );
}

export default SharedSummary;