import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';

// Import the new components
import Login from './components/Login';
import Summarizer from './components/Summarizer';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const { user } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('Summarize the following transcript into a concise executive summary, highlighting the key decisions and outcomes. Format the output as clean markdown.');
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

  // New function to clear the inputs
  const handleClear = () => {
    setTranscript('');
    setSelectedFile(null);
    setSummary(null);
    setShowHistory(true);
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
    return <Login />;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="w-full flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Summarizer
          transcript={transcript} setTranscript={setTranscript}
          prompt={prompt} setPrompt={setPrompt}
          isLoading={isLoading}
          selectedFile={selectedFile}
          handleFileChange={handleFileChange}
          clearFile={clearFile}
          handleGenerateSummary={handleGenerateSummary}
          handleClear={handleClear} // Pass the new clear function
        />
        <ResultsPanel
          user={user}
          summary={summary}
          summariesHistory={summariesHistory}
          showHistory={showHistory} setShowHistory={setShowHistory}
          statusMessage={statusMessage} setStatusMessage={setStatusMessage} // Pass the setter function
          recipient={recipient} setRecipient={setRecipient}
          handleSelectSummaryFromHistory={handleSelectSummaryFromHistory}
          handleCopyToClipboard={handleCopyToClipboard}
          handleShareEmail={handleShareEmail}
        />
      </motion.div>
    </div>
  );
}

export default App;
