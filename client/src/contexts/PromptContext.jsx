import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'react-hot-toast';

// 1. Create the Context
const PromptContext = createContext();

// 2. Create the Provider component
export function PromptProvider({ children }) {
  const { user } = useAuth();

  // --- All State related to prompts now lives here ---
  const [prompts, setPrompts] = useState([]);
  const [prompt, setPrompt] = useState(''); // The currently active prompt text

  // --- All Functions related to prompts now live here ---

  useEffect(() => {
    if (user) {
      fetchPrompts();
    } else {
      setPrompts([]);
      setPrompt('');
    }
  }, [user]);

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

  // The value that will be available to all children
  const value = {
    prompts,
    prompt,
    setPrompt,
    fetchPrompts,
    handleSavePrompt,
    handleDeletePrompt,
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
}

// 3. Create a custom hook for easy access to the context
export function usePrompts() {
  return useContext(PromptContext);
}
