import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import History from './components/History';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Sparkles, Link, Send } from 'lucide-react';

// A simple, inline SVG component for the Google G logo
const GoogleIcon = () => (
  <svg className="h-6 w-6 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

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
      <div className="w-full flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-4xl font-bold text-slate-800">Welcome to LexoraAI</h1>
          <p className="mt-4 text-lg text-slate-600">Please log in to summarize your meetings, view your history, and share insights.</p>
          <motion.a
            href="http://localhost:5001/auth/google"
            className="mt-8 inline-flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition duration-200 shadow-sm text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GoogleIcon />
            Login with Google
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="w-full flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="lg:w-2/3 w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">Meeting Summarizer</h1>
            <p className="text-slate-500 mt-2">Upload or paste your meeting notes to get a quick summary.</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">1. Provide Transcript</h2>
            <div className="p-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
              <label htmlFor="file-input" className="cursor-pointer inline-flex items-center px-4 py-2 bg-white text-slate-800 rounded-md font-semibold hover:bg-slate-100 transition border border-slate-300 shadow-sm">
                <UploadCloud className="h-5 w-5 mr-2" />
                Choose a .txt or .docx file
              </label>
              <input id="file-input" type="file" accept=".txt,.docx" className="hidden" onChange={handleFileChange} />
              {selectedFile && (
                <div className="mt-4 text-sm text-slate-600 flex items-center justify-center">
                  <span>{selectedFile.name}</span>
                  <button onClick={clearFile} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                </div>
              )}
            </div>
            <div className="flex items-center text-slate-500"><hr className="flex-grow"/><span className="px-2 text-sm">OR</span><hr className="flex-grow"/></div>
            <textarea
              rows="8"
              placeholder="Paste your meeting notes here..."
              value={transcript}
              onChange={(e) => { setTranscript(e.target.value); if (selectedFile) clearFile(); }}
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition"
              disabled={!!selectedFile}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">2. Choose Instruction</h2>
            <div className="flex flex-wrap gap-2">
              {promptTemplates.map((template) => (
                <button key={template.title} onClick={() => setPrompt(template.prompt)} className={`px-4 py-1.5 text-sm rounded-full transition ${prompt === template.prompt ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {template.title}
                </button>
              ))}
            </div>
            <textarea
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <motion.button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-lg flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : <Sparkles className="h-6 w-6 mr-2" />}
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </motion.button>
        </div>
        <div className="lg:w-1/3 w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{showHistory ? 'History' : 'Generated Summary'}</h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
              disabled={!summary && !showHistory}
            >
              {showHistory ? (summary ? 'Show Summary' : '') : 'Show History'}
            </button>
          </div>
          <AnimatePresence>
            {statusMessage && (
              <motion.p
                key="status-message"
                className="text-center font-semibold text-blue-600 pb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {statusMessage}
              </motion.p>
            )}
          </AnimatePresence>
          {showHistory ? (
            <History summaries={summariesHistory} onSelectSummary={handleSelectSummaryFromHistory} />
          ) : summary ? (
            <motion.div className="space-y-6" initial={{opacity: 0}} animate={{opacity: 1}}>
              <div className="prose prose-slate max-w-none p-4 bg-slate-50 rounded-lg border h-96 overflow-y-auto">
                <ReactMarkdown>{summary.summaryText}</ReactMarkdown>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCopyToClipboard} className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors shadow-md">
                <Link className="h-5 w-5 mr-2" /> Copy Shareable Link
              </motion.button>
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700">Share via Email</h3>
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleShareEmail} className="sm:w-auto w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors shadow-md">
                    <Send className="h-5 w-5 mr-2" /> Send
                  </motion.button>
                </div>
                <p className="text-xs text-center text-slate-500">
                  Sending from: <span className="font-medium">{user.email}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Your new summary will appear here after generation.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default App;
