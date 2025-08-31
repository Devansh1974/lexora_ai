import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Sparkles, RotateCcw, Save, Trash2, X } from 'lucide-react';

function Summarizer({
  transcript, setTranscript,
  prompt, setPrompt,
  isLoading,
  selectedFile,
  handleFileChange,
  clearFile,
  handleGenerateSummary,
  handleClear,
  prompts,
  handleSavePrompt,
  handleDeletePrompt,
}) {
  const [isMac, setIsMac] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const defaultPrompts = prompts.filter(p => !p._user);
  const customPrompts = prompts.filter(p => p._user);

  const onSaveClick = () => {
    if (prompt.trim()) {
      setIsSaving(true);
    }
  };

  const onConfirmSave = () => {
    if (newPromptTitle.trim()) {
      handleSavePrompt(newPromptTitle, prompt);
      setIsSaving(false);
      setNewPromptTitle('');
    }
  };

  return (
    // --- CORRECTED: Main container is a flex column to enable scrolling ---
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col h-full">
      {/* Header Section (Fixed Height) */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white">Meeting Summarizer</h1>
            <p className="text-slate-400 mt-2">Upload or paste your meeting notes to get a quick summary.</p>
          </div>
          <motion.button
            onClick={handleClear}
            className="flex items-center text-sm font-semibold text-slate-300 hover:text-white transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Summary
          </motion.button>
        </div>
      </div>

      {/* --- CORRECTED: Main content area is now flexible and scrollable --- */}
      <div className="flex-grow overflow-y-auto space-y-8 pr-4 -mr-4 mt-8">
        {/* Transcript Input Section */}
        <motion.div className="space-y-4" variants={sectionVariants} initial="hidden" animate="visible">
          <h2 className="text-xl font-semibold text-slate-200">1. Provide Transcript</h2>
          <div className="p-6 border-2 border-dashed border-slate-600 rounded-lg text-center bg-slate-900/50">
            <label htmlFor="file-input" className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-700 text-slate-100 rounded-md font-semibold hover:bg-slate-600 transition border border-slate-500 shadow-sm">
              <UploadCloud className="h-5 w-5 mr-2" />
              Choose a .txt or .docx file
            </label>
            <input id="file-input" type="file" accept=".txt,.docx" className="hidden" onChange={handleFileChange} />
            {selectedFile && (
              <div className="mt-4 text-sm text-slate-400 flex items-center justify-center">
                <span>{selectedFile.name}</span>
                <button onClick={clearFile} className="ml-2 text-red-500 hover:text-red-400 font-bold">&times;</button>
              </div>
            )}
          </div>
          <div className="flex items-center text-slate-500"><hr className="flex-grow border-slate-700"/><span className="px-2 text-sm">OR</span><hr className="flex-grow border-slate-700"/></div>
          <textarea
            rows="8"
            placeholder="Paste your meeting notes here..."
            value={transcript}
            onChange={(e) => { setTranscript(e.target.value); if (selectedFile) clearFile(); }}
            className="w-full p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 transition bg-slate-700/50 text-slate-200 placeholder-slate-500 focus:border-indigo-500"
            disabled={!!selectedFile}
          />
        </motion.div>

        {/* Instruction Section */}
        <motion.div className="space-y-4" variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-semibold text-slate-200">2. Choose Instruction</h2>
          
          <div className="flex flex-wrap gap-2">
            {defaultPrompts.map((p) => (
              <button key={p._id} onClick={() => setPrompt(p.promptText)} className={`px-4 py-1.5 text-sm rounded-full transition ${prompt === p.promptText ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                {p.title}
              </button>
            ))}
          </div>
          
          {customPrompts.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
               <h3 className="w-full text-sm font-semibold text-slate-400 mb-1">Your Templates</h3>
              {customPrompts.map((p) => (
                <div key={p._id} className="group relative">
                  <button onClick={() => setPrompt(p.promptText)} className={`pr-8 pl-4 py-1.5 text-sm rounded-full transition ${prompt === p.promptText ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                    {p.title}
                  </button>
                  <button onClick={() => handleDeletePrompt(p._id)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <textarea
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 pr-10 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 transition bg-slate-700/50 text-slate-200 placeholder-slate-500 focus:border-indigo-500"
              placeholder="Or write your own custom instruction..."
            />
            <motion.button 
              onClick={onSaveClick} 
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-blue-400"
              whileHover={{ scale: 1.1 }}
              title="Save as template"
            >
              <Save className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Generate Button (Fixed Height) */}
      <motion.button
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="w-full mt-8 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-lg flex items-center justify-center shadow-lg shadow-blue-500/20"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : <Sparkles className="h-6 w-6 mr-2" />}
        {isLoading ? 'Generating...' : 'Generate Summary'}
        {!isLoading && (
          <span className="ml-auto text-xs opacity-70">
            {isMac ? '⌘ + ↵' : 'Ctrl + Enter'}
          </span>
        )}
      </motion.button>

      {/* Save Prompt Modal */}
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-100">Save Prompt Template</h3>
                <button onClick={() => setIsSaving(false)} className="p-1 rounded-full hover:bg-slate-700">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-1">Give your prompt a short, memorable title.</p>
              <input 
                type="text"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
                placeholder="e.g., Weekly Project Update"
                className="w-full mt-4 p-2 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 bg-slate-700 text-slate-100 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && onConfirmSave()}
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setIsSaving(false)} className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-600 hover:bg-slate-500 rounded-md">Cancel</button>
                <button onClick={onConfirmSave} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Summarizer;

