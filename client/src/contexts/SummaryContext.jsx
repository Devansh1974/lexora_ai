import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 1. Create the Context
const SummaryContext = createContext();

// 2. Create the Provider component
export function SummaryProvider({ children }) {
  const { user } = useAuth();

  // --- All State related to summaries now lives here ---
  const [summary, setSummary] = useState(null);
  const [summariesHistory, setSummariesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isRefining, setIsRefining] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- All Functions related to summaries now live here ---

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setSummariesHistory([]);
      setSummary(null);
      setShowHistory(true);
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

  const handleGenerateSummary = async (formData) => {
    setIsLoading(true);
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
        const input = document.getElementById('summary-content-exportable');
        if (input) {
          toast.loading('Generating PDF...');
          html2canvas(input, { 
            scale: 2,
            backgroundColor: null,
            onclone: (document) => {
              const content = document.getElementById('summary-content-exportable');
              content.style.color = '#333';
              content.style.background = '#fff';
              content.style.padding = '20px';
            }
          }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgWidth = pdfWidth;
            const imgHeight = imgWidth / ratio;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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

  // The value that will be available to all children
  const value = {
    summary, setSummary,
    summariesHistory, setSummariesHistory,
    isLoading, setIsLoading,
    isHistoryLoading,
    isRefining,
    showHistory, setShowHistory,
    recipient, setRecipient,
    searchTerm, setSearchTerm,
    fetchHistory,
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
}

// 3. Create a custom hook for easy access to the context
export function useSummary() {
  return useContext(SummaryContext);
}
