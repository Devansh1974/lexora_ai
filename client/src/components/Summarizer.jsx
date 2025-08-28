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
  prompts, // New prop: array of all prompts from DB
  handleSavePrompt, // New prop: function to save a custom prompt
  handleDeletePrompt, // New prop: function to delete a custom prompt
}) {
  const [isMac, setIsMac] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // State for the save modal
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
    <div className="lg:w-2/3 w-full bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-slate-800">Meeting Summarizer</h1>
          <p className="text-slate-500 mt-2">Upload or paste your meeting notes to get a quick summary.</p>
        </div>
        <motion.button
          onClick={handleClear}
          className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Summary
        </motion.button>
      </div>

      {/* Transcript Input Section */}
      <motion.div className="space-y-4" variants={sectionVariants} initial="hidden" animate="visible">
        <h2 className="text-xl font-semibold text-slate-700">1. Provide Transcript</h2>
        <div className="p-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50/70">
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
          className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition bg-white/50"
          disabled={!!selectedFile}
        />
      </motion.div>

      {/* Instruction Section */}
      <motion.div className="space-y-4" variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-semibold text-slate-700">2. Choose Instruction</h2>
        
        {/* Default Prompts */}
        <div className="flex flex-wrap gap-2">
          {defaultPrompts.map((p) => (
            <button key={p._id} onClick={() => setPrompt(p.promptText)} className={`px-4 py-1.5 text-sm rounded-full transition ${prompt === p.promptText ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {p.title}
            </button>
          ))}
        </div>
        
        {/* Custom Prompts */}
        {customPrompts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
             <h3 className="w-full text-sm font-semibold text-slate-500 mb-1">Your Templates</h3>
            {customPrompts.map((p) => (
              <div key={p._id} className="group relative">
                <button onClick={() => setPrompt(p.promptText)} className={`pr-8 pl-4 py-1.5 text-sm rounded-full transition ${prompt === p.promptText ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {p.title}
                </button>
                <button onClick={() => handleDeletePrompt(p._id)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
            className="w-full p-3 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition bg-white/50"
            placeholder="Or write your own custom instruction..."
          />
          <motion.button 
            onClick={onSaveClick} 
            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-blue-600"
            whileHover={{ scale: 1.1 }}
            title="Save as template"
          >
            <Save className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Generate Button */}
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
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Save Prompt Template</h3>
                <button onClick={() => setIsSaving(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Give your prompt a short, memorable title.</p>
              <input 
                type="text"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
                placeholder="e.g., Weekly Project Update"
                className="w-full mt-4 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && onConfirmSave()}
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setIsSaving(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">Cancel</button>
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
