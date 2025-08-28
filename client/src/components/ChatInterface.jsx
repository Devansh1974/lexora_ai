import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Undo, Save, Lightbulb } from 'lucide-react';

const suggestedPrompts = [
  "Make it shorter",
  "Make it more formal",
  "Extract action items",
];

function ChatInterface({ 
  summary, 
  handleRefineSummary, 
  handleSaveChanges,
  isRefining 
}) {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [currentSummary, setCurrentSummary] = useState(summary.summaryText);
  const [previousSummary, setPreviousSummary] = useState(summary.summaryText);

  const chatEndRef = useRef(null);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const onRefine = async (prompt) => {
    if (!prompt.trim() || isRefining) return;

    const newUserMessage = { role: 'user', content: prompt };
    setConversation(prev => [...prev, newUserMessage]);
    
    setPreviousSummary(currentSummary); // Save the current state for undo
    
    const refinedText = await handleRefineSummary(currentSummary, prompt);
    if (refinedText) {
      setCurrentSummary(refinedText);
      const newAiMessage = { role: 'ai', content: refinedText };
      setConversation(prev => [...prev, newAiMessage]);
    }
    setUserInput('');
  };

  const handleUndo = () => {
    setCurrentSummary(previousSummary);
    // Remove the last user and AI message from the conversation
    setConversation(prev => prev.slice(0, -2)); 
  };
  
  const handleSave = () => {
    handleSaveChanges(summary._id, currentSummary);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary Display */}
      <div id="summary-content" className="prose prose-slate max-w-none p-4 bg-slate-50/70 rounded-lg border border-slate-200 flex-grow overflow-y-auto mb-4">
        <ReactMarkdown>{currentSummary}</ReactMarkdown>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSave} 
            className="flex items-center text-sm font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
          {conversation.length > 0 && (
            <button 
              onClick={handleUndo} 
              className="flex items-center text-sm font-semibold px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo Last
            </button>
          )}
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-slate-500 flex-shrink-0" />
        {suggestedPrompts.map(prompt => (
          <button 
            key={prompt}
            onClick={() => onRefine(prompt)}
            className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="relative">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onRefine(userInput)}
          placeholder={isRefining ? "AI is thinking..." : "Refine your summary..."}
          disabled={isRefining}
          className="w-full p-3 pr-12 border border-slate-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-blue-500 transition"
        />
        <motion.button
          onClick={() => onRefine(userInput)}
          disabled={isRefining || !userInput.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md disabled:bg-slate-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="h-5 w-5" />
        </motion.button>
      </div>
      <div ref={chatEndRef} />
    </div>
  );
}

export default ChatInterface;
