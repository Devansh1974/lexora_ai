import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import all components
import Login from './components/Login';
import Summarizer from './components/Summarizer';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const { user } = useAuth();
  // State for core functionality
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State for UI and loading
  const [isLoading, setIsLoading] = useState(false); // For initial generation
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isRefining, setIsRefining] = useState(false); // For conversational edits

  // State for panels and child components
  const [summariesHistory, setSummariesHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [prompts, setPrompts] = useState([]);

  // --- Core Logic Hooks ---

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchPrompts();
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

  // --- Data Fetching and Management ---

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

  const fetchPrompts = async () => {
    try {
      const response = await api.get('/api/prompts');
      setPrompts(response.data);
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
      await fetchPrompts();
      toast.success('Prompt template saved!');
    } catch (error) {
      toast.error('Failed to save prompt.');
    }
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      await api.delete(`/api/prompts/${promptId}`);
      await fetchPrompts();
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

  // --- Conversational Editing Functions ---

  const handleRefineSummary = async (currentSummary, refinementPrompt) => {
    setIsRefining(true);
    try {
      const response = await api.post('/api/summaries/refine', {
        currentSummary,
        refinementPrompt,
      });
      return response.data.refinedText;
    } catch (error) {
      toast.error('Failed to refine summary.');
      return null;
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveChanges = async (summaryId, newSummaryText) => {
    const toastId = toast.loading('Saving changes...');
    try {
      setSummary(prev => ({ ...prev, summaryText: newSummaryText }));
      
      await api.patch(`/api/summaries/${summaryId}/text`, { summaryText: newSummaryText });
      await fetchHistory();
      toast.success('Changes saved!', { id: toastId });
    } catch (error) {
      toast.error('Failed to save changes.', { id: toastId });
    }
  };

  // --- Sharing and Exporting ---

  const handleCopyToClipboard = () => {
    if (!summary || !summary.shareId) return;
    const shareLink = `${window.location.origin}/summary/${summary.shareId}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success('Shareable link copied!');
    });
  };

  const handleShareEmail = async (currentSummaryText) => {
    if (!currentSummaryText || !recipient) {
      toast.error('Please provide a recipient email.');
      return;
    }
    const toastId = toast.loading('Sending email...');
    try {
      await api.post('/api/share', {
        summary: currentSummaryText,
        recipient,
      });
      toast.success('Email sent successfully!', { id: toastId });
      setRecipient('');
    } catch (error) {
      toast.error('Error: Could not send email.', { id: toastId });
      console.error('Sharing error:', error);
    }
  };

  const handleExport = (format, currentSummaryText) => {
    if (!summary) {
      toast.error('No summary to export.');
      return;
    }
    const title = summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const content = currentSummaryText;

    if (format === 'pdf') {
      const input = document.getElementById('summary-content');
      if (input) {
        toast.loading('Generating PDF...');
        html2canvas(input, { 
          scale: 2,
          backgroundColor: null,
          onclone: (document) => {
            document.getElementById('summary-content').style.color = '#000';
          }
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const ratio = canvasWidth / canvasHeight;
          const imgWidth = pdfWidth - 20;
          const imgHeight = imgWidth / ratio;
          
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save(`${title}.pdf`);
          toast.dismiss();
          toast.success('PDF downloaded!');
        });
      }
    } else {
      const mimeType = format === 'md' ? 'text/markdown' : 'text/plain';
      const fileExtension = format === 'md' ? 'md' : 'txt';
      
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`.${fileExtension} file downloaded!`);
    }
  };

  // --- Render Logic ---

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1e293b', // slate-800
            color: '#e2e8f0',     // slate-200
            border: '1px solid #334155' // slate-700
          },
        }}
      />
      <div className="w-full min-h-full py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          // --- CORRECTED: Use items-stretch for equal height columns ---
          className="w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* --- CORRECTED: Added h-full to ensure the div stretches --- */}
          <div className="lg:col-span-3 h-full">
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
          </div>
          
          {/* --- CORRECTED: Added h-full to ensure the div stretches --- */}
          <div className="lg:col-span-2 h-full">
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
              handleExport={handleExport}
              handleRefineSummary={handleRefineSummary}
              handleSaveChanges={handleSaveChanges}
              isRefining={isRefining}
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default App;

