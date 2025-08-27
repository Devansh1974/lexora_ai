import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Sparkles, RotateCcw } from 'lucide-react'; // Added RotateCcw for the clear button

const promptTemplates = [
  { title: 'Executive Summary', prompt: 'Summarize the following transcript into a concise executive summary, highlighting the key decisions and outcomes. Format the output as clean markdown.' },
  { title: 'Action Items', prompt: 'Extract all action items from the transcript. List them as a markdown checklist with assigned owners if mentioned.' },
  { title: 'Bullet Points', prompt: 'Condense the key topics of this meeting into a series of clear and concise markdown bullet points.' },
];

function Summarizer({
  transcript, setTranscript,
  prompt, setPrompt,
  isLoading,
  selectedFile,
  handleFileChange,
  clearFile,
  handleGenerateSummary,
  handleClear // New prop for the clear button functionality
}) {

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    // Updated main container with glassmorphism effect
    <div className="lg:w-2/3 w-full bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8 space-y-8">
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

      <motion.div className="space-y-4" variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
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
          className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition bg-white/50"
        />
      </motion.div>

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
  );
}

export default Summarizer;
