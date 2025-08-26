import React, { useState, useEffect } from 'react';
import api from './api'; // Import our custom api instance instead of axios
import { useAuth } from './AuthContext';
import History from './components/History';
import ReactMarkdown from 'react-markdown';

const promptTemplates = [
  { title: 'Executive Summary', prompt: 'Summarize the following transcript into a concise executive summary, highlighting the key decisions and outcomes. Format the output as clean markdown.' },
  { title: 'Action Items', prompt: 'Extract all action items from the transcript. List them as a markdown checklist with assigned owners if mentioned.' },
  { title: 'Bullet Points', prompt: 'Condense the key topics of this meeting into a series of clear and concise markdown bullet points.' },
];

function App() {
  const { user } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState(promptTemplates[0].prompt);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [summariesHistory, setSummariesHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setSummariesHistory([]);
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      // Use the 'api' instance
      const response = await api.get('/api/summaries');
      setSummariesHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setTranscript('');
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (document.getElementById('file-input')) {
      document.getElementById('file-input').value = null;
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedFile && !transcript) {
      setStatusMessage('Please upload a transcript file or paste the text.');
      return;
    }
    setIsLoading(true);
    setStatusMessage('');
    const formData = new FormData();
    formData.append('prompt', prompt);
    if (selectedFile) {
      formData.append('file', selectedFile);
    } else {
      formData.append('transcript', transcript);
    }

    try {
      // Use the 'api' instance
      const response = await api.post('/api/summarize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSummary(response.data);
      fetchHistory();
      setShowHistory(false);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Could not generate summary.';
      setStatusMessage(`Error: ${errorMsg}`);
    }
    setIsLoading(false);
  };

  const handleSelectSummaryFromHistory = (selectedSummary) => {
    setSummary(selectedSummary);
    setTranscript(selectedSummary.originalContent);
    setPrompt(selectedSummary.prompt);
    setShowHistory(false);
  };

  const handleCopyToClipboard = () => {
    if (!summary || !summary.shareId) return;
    const shareLink = `${window.location.origin}/summary/${summary.shareId}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setStatusMessage('Shareable link copied to clipboard!');
      setTimeout(() => setStatusMessage(''), 3000);
    });
  };

  const handleShareEmail = async () => {
    if (!summary || !recipient) {
      setStatusMessage('Please provide a recipient email.');
      return;
    }
    setStatusMessage('Sending email...');
    try {
      // Use the 'api' instance
      await api.post('/api/share', {
        summary: summary.summaryText,
        recipient,
      });
      setStatusMessage('Email sent successfully!');
      setRecipient('');
    } catch (error) {
      setStatusMessage('Error: Could not send email.');
      console.error('Sharing error:', error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 mt-10">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to LexoraAI</h1>
          <p className="mt-4 text-lg text-gray-600">Please log in to summarize your meetings and view your history.</p>
          <a href="http://localhost:5001/auth/google" className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg">
            Login with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
        <div className="lg:w-2/3 w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800">Meeting Summarizer</h1>
            <p className="text-gray-500 mt-2">Upload or paste your meeting notes to get a quick summary.</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">1. Provide Transcript</h2>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <label htmlFor="file-input" className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Choose a .txt or .docx file
              </label>
              <input id="file-input" type="file" accept=".txt,.docx" className="hidden" onChange={handleFileChange} />
              {selectedFile && (
                <div className="mt-4 text-sm text-gray-600 flex items-center justify-center">
                  <span>{selectedFile.name}</span>
                  <button onClick={clearFile} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-500"><hr className="flex-grow border-t border-gray-300" /><span className="px-2">OR</span><hr className="flex-grow border-t border-gray-300" /></div>
            <textarea
              rows="8"
              placeholder="Paste your meeting notes here..."
              value={transcript}
              onChange={(e) => { setTranscript(e.target.value); if (selectedFile) clearFile(); }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition"
              disabled={!!selectedFile}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">2. Choose Instruction</h2>
            <div className="flex flex-wrap gap-2">
              {promptTemplates.map((template) => (
                <button key={template.title} onClick={() => setPrompt(template.prompt)} className={`px-3 py-1 text-sm rounded-full transition ${prompt === template.prompt ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {template.title}
                </button>
              ))}
            </div>
            <textarea
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button onClick={handleGenerateSummary} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition text-lg flex items-center justify-center">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : '✨'}
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
        <div className="lg:w-1/3 w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{showHistory ? 'History' : 'Generated Summary'}</h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm font-semibold text-blue-600 hover:underline"
              disabled={!summary && !showHistory}
            >
              {showHistory ? (summary ? 'Show Summary' : '') : 'Show History'}
            </button>
          </div>
          {statusMessage && <p className="text-center font-semibold text-blue-600 pb-4">{statusMessage}</p>}
          {showHistory ? (
            <History summaries={summariesHistory} onSelectSummary={handleSelectSummaryFromHistory} />
          ) : summary ? (
            <div className="space-y-6">
              <div className="prose max-w-none p-4 bg-gray-50 rounded-lg border h-96 overflow-y-auto">
                <ReactMarkdown>{summary.summaryText}</ReactMarkdown>
              </div>
              <button onClick={handleCopyToClipboard} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                Copy Shareable Link 🔗
              </button>
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-700">Share via Email</h3>
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button onClick={handleShareEmail} className="sm:w-auto w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
                    Send
                  </button>
                </div>
                <p className="text-xs text-center text-gray-500">
                  Sending from: <span className="font-medium">{user.email}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Your new summary will appear here after generation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
