import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SummaryContext = createContext();

// EXPORT THE CUSTOM HOOK
export const useSummaries = () => {
  return useContext(SummaryContext);
};

export const SummaryProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isRefining, setIsRefining] = useState(false);
  const [summariesHistory, setSummariesHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setSummariesHistory([]);
    }
  }, [user]);

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

  const handleGenerateSummary = async (prompt) => {
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

  const value = {
    transcript, setTranscript,
    summary, setSummary,
    selectedFile, setSelectedFile,
    isLoading, setIsLoading,
    isHistoryLoading, setIsHistoryLoading,
    isRefining, setIsRefining,
    summariesHistory, setSummariesHistory,
    showHistory, setShowHistory,
    recipient, setRecipient,
    searchTerm, setSearchTerm,
    fetchHistory,
    handleFileChange,
    clearFile,
    handleClear,
    handleGenerateSummary,
    handleSelectSummaryFromHistory,
    handleRenameSummary,
    handleRefineSummary,
    handleSaveChanges,
    handleCopyToClipboard,
    handleShareEmail,
    handleExport,
  };

  return (
    <SummaryContext.Provider value={value}>
      {children}
    </SummaryContext.Provider>
  );
};

