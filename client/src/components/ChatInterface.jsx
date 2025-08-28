import React, { useState, useRef, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Undo, Save, Lightbulb, Link, Copy, ChevronDown, FileText, FileCode, FileType } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';

const suggestedPrompts = [
  "Make it shorter",
  "Make it more formal",
  "Extract action items",
];

function ChatInterface({ 
  summary, 
  handleRefineSummary, 
  handleSaveChanges,
  isRefining,
  // Add the missing props back
  handleCopyToClipboard,
  handleExport,
  handleShareEmail,
  recipient,
  setRecipient,
  user
}) {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [currentSummary, setCurrentSummary] = useState(summary.summaryText);
  const [previousSummary, setPreviousSummary] = useState(summary.summaryText);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const onRefine = async (prompt) => {
    if (!prompt.trim() || isRefining) return;

    const newUserMessage = { role: 'user', content: prompt };
    setConversation(prev => [...prev, newUserMessage]);
    
    setPreviousSummary(currentSummary);
    
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
    setConversation(prev => prev.slice(0, -2)); 
  };
  
  const handleSave = () => {
    handleSaveChanges(summary._id, currentSummary);
  };

  const handleCopyText = () => {
    if (!currentSummary) return;
    navigator.clipboard.writeText(currentSummary).then(() => {
      toast.success('Summary text copied!');
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Summary Display */}
      <div className="relative group flex-grow">
        <div id="summary-content" className="prose prose-slate max-w-none p-4 bg-slate-50/70 rounded-lg border border-slate-200 h-full overflow-y-auto">
          <ReactMarkdown>{currentSummary}</ReactMarkdown>
        </div>
        <motion.button
          onClick={handleCopyText}
          className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-sm rounded-md text-slate-500 hover:text-slate-800 hover:bg-white transition opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Copy summary text"
        >
          <Copy className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCopyToClipboard} className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors shadow-md">
            <Link className="h-5 w-5 mr-2" /> Copy Link
        </motion.button>
        <Menu as="div" className="relative">
            <Menu.Button as={motion.button} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center bg-slate-700 text-white font-bold py-3 px-4 rounded-md hover:bg-slate-800 transition-colors shadow-md">
                <ChevronDown className="h-5 w-5 mr-2" /> Export As
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 bottom-full mb-2 w-full origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                    <Menu.Item>{({ active }) => (<button onClick={() => handleExport('pdf')} className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}><FileType className="mr-3 h-5 w-5 text-red-500"/> PDF</button>)}</Menu.Item>
                    <Menu.Item>{({ active }) => (<button onClick={() => handleExport('md')} className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}><FileCode className="mr-3 h-5 w-5 text-blue-500"/> Markdown</button>)}</Menu.Item>
                    <Menu.Item>{({ active }) => (<button onClick={() => handleExport('txt')} className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}><FileText className="mr-3 h-5 w-5 text-gray-500"/> Text</button>)}</Menu.Item>
                </div>
                </Menu.Items>
            </Transition>
        </Menu>
      </div>

      {/* Email Sharing */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700">Share via Email</h3>
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <input type="email" placeholder="recipient@example.com" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 transition bg-white/50"/>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleShareEmail(currentSummary)} className="sm:w-auto w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors shadow-md">
            <Send className="h-5 w-5 mr-2" /> Send
          </motion.button>
        </div>
        <p className="text-xs text-center text-slate-500">Sending from: <span className="font-medium">{user.email}</span></p>
      </div>

      {/* Conversational Editing */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-700">Refine Summary</h3>
            <div className="flex items-center space-x-2">
                <button onClick={handleSave} className="flex items-center text-sm font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"><Save className="h-4 w-4 mr-2" />Save Changes</button>
                {conversation.length > 0 && (<button onClick={handleUndo} className="flex items-center text-sm font-semibold px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"><Undo className="h-4 w-4 mr-2" />Undo</button>)}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-slate-500 flex-shrink-0" />
            {suggestedPrompts.map(prompt => (<button key={prompt} onClick={() => onRefine(prompt)} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">{prompt}</button>))}
        </div>
        <div className="relative">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onRefine(userInput)} placeholder={isRefining ? "AI is thinking..." : "Make it shorter, change the tone..."} disabled={isRefining} className="w-full p-3 pr-12 border border-slate-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-blue-500 transition"/>
            <motion.button onClick={() => onRefine(userInput)} disabled={isRefining || !userInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md disabled:bg-slate-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Send className="h-5 w-5" /></motion.button>
        </div>
      </div>
      <div ref={chatEndRef} />
    </div>
  );
}

export default ChatInterface;
