import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

// Import the new components
import Login from './components/Login';
import Summarizer from './components/Summarizer';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const { user } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState(''); // Will be set by fetched prompts
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [summariesHistory, setSummariesHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [prompts, setPrompts] = useState([]); // New state for all prompts

  // --- Logic Functions ---

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchPrompts(); // Fetch prompts when user logs in
    } else {
      setSummariesHistory([]);
      setPrompts([]);
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!isLoading) {
          handleGenerateSummary();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [transcript, prompt, selectedFile, isLoading]);


  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await api.get('/api/summaries');
      setSummariesHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to fetch history.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // --- NEW: Prompt Management Functions ---
  const fetchPrompts = async () => {
    try {
      const response = await api.get('/api/prompts');
      setPrompts(response.data);
      // Set the initial prompt to the first default prompt if it's not already set
      if (!prompt && response.data.length > 0) {
        const defaultPrompt = response.data.find(p => !p._user);
        if (defaultPrompt) {
          setPrompt(defaultPrompt.promptText);
        }
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      toast.error('Failed to fetch prompts.');
    }
  };

  const handleSavePrompt = async (title, promptText) => {
    try {
      await api.post('/api/prompts', { title, promptText });
      await fetchPrompts(); // Refetch to update the list
      toast.success('Prompt template saved!');
    } catch (error) {
      toast.error('Failed to save prompt.');
    }
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      await api.delete(`/api/prompts/${promptId}`);
      await fetchPrompts(); // Refetch to update the list
      toast.success('Prompt template deleted!');
    } catch (error) {
      toast.error('Failed to delete prompt.');
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
      toast.error('Please upload a transcript file or paste the text.');
      return;
    }
    setIsLoading(true);
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
      await fetchHistory();
      setShowHistory(false);
      toast.success('Summary generated successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Could not generate summary.';
      toast.error(`Error: ${errorMsg}`);
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
      toast.success('Shareable link copied!');
    });
  };

  const handleShareEmail = async () => {
    if (!summary || !recipient) {
      toast.error('Please provide a recipient email.');
      return;
    }
    const toastId = toast.loading('Sending email...');
    try {
      await api.post('/api/share', {
        summary: summary.summaryText,
        recipient,
      });
      toast.success('Email sent successfully!', { id: toastId });
      setRecipient('');
    } catch (error) {
      toast.error('Error: Could not send email.', { id: toastId });
      console.error('Sharing error:', error);
    }
  };

  const handleRenameSummary = async (summaryId, newTitle) => {
    const originalSummaries = [...summariesHistory];
    const updatedSummaries = summariesHistory.map(s => 
      s._id === summaryId ? { ...s, title: newTitle } : s
    );
    setSummariesHistory(updatedSummaries);

    try {
      await api.patch(`/api/summaries/${summaryId}`, { title: newTitle });
      toast.success('Summary renamed!');
    } catch (error) {
      setSummariesHistory(originalSummaries);
      toast.error('Failed to rename summary.');
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
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
            handleClear={handleClear}
            prompts={prompts}
            handleSavePrompt={handleSavePrompt}
            handleDeletePrompt={handleDeletePrompt}
          />
          <ResultsPanel
            user={user}
            summary={summary}
            summariesHistory={summariesHistory}
            isHistoryLoading={isHistoryLoading}
            showHistory={showHistory} setShowHistory={setShowHistory}
            recipient={recipient} setRecipient={setRecipient}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            handleSelectSummaryFromHistory={handleSelectSummaryFromHistory}
            handleCopyToClipboard={handleCopyToClipboard}
            handleShareEmail={handleShareEmail}
            handleRenameSummary={handleRenameSummary}
          />
        </motion.div>
      </div>
    </>
  );
}

export default App;
