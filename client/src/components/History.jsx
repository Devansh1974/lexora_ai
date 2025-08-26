// src/History.jsx
import React from 'react';

function History({ summaries, onSelectSummary }) {
  if (!summaries.length) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Your generated summaries will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {summaries.map((summary) => (
        <div
          key={summary._id}
          onClick={() => onSelectSummary(summary)}
          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition"
        >
          <p className="font-semibold text-gray-800 truncate">{summary.prompt}</p>
          <p className="text-sm text-gray-500 truncate">{summary.summaryText}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(summary.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default History;