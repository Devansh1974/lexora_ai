import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // State management remains the same
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('Summarize in bullet points for executives');
  const [summary, setSummary] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // API call handlers remain the same
  const handleGenerateSummary = async () => {
    if (!transcript) {
      setStatusMessage('Please provide a transcript.');
      return;
    }
    setIsLoading(true);
    setStatusMessage('');
    try {
      const response = await axios.post('http://localhost:5001/api/summarize', {
        transcript,
        prompt,
      });
      setSummary(response.data.summary);
    } catch (error) {
      setStatusMessage('Error: Could not generate summary.');
      console.error('Generation error:', error);
    }
    setIsLoading(false);
  };

  const handleShareEmail = async () => {
    if (!summary || !recipient) {
      setStatusMessage('Please generate a summary and provide a recipient email.');
      return;
    }
    setStatusMessage('Sending email...');
    try {
      await axios.post('http://localhost:5001/api/share', {
        summary,
        recipient,
      });
      setStatusMessage('Email sent successfully!');
    } catch (error) {
      setStatusMessage('Error: Could not send email.');
      console.error('Sharing error:', error);
    }
  };

  // The main change is in the JSX, using Tailwind classes for styling
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          AI Meeting Notes Summarizer 📝
        </h1>

        {/* Section 1: Transcript Input */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700">1. Upload Transcript</h2>
          <textarea
            rows="10"
            placeholder="Paste your meeting notes or call transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Section 2: Custom Prompt */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700">2. Enter Custom Instruction</h2>
          <input
            type="text"
            placeholder="e.g., Highlight only action items"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Summary ✨'}
        </button>

        {/* Section 3: Summary Display and Edit */}
        {summary && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700">3. Review and Edit Summary</h2>
            <textarea
              rows="10"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        )}

        {/* Section 4: Share via Email */}
        {summary && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700">4. Share via Email</h2>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="email"
                placeholder="recipient@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button 
                onClick={handleShareEmail}
                className="sm:w-auto w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
              >
                Share 📧
              </button>
            </div>
          </div>
        )}
        
        {/* Status Message */}
        {statusMessage && (
            <p className="text-center font-semibold text-blue-600 pt-4">
                {statusMessage}
            </p>
        )}
      </div>
    </div>
  );
}

export default App;
