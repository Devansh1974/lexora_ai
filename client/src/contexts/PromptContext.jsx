import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'react-hot-toast';

const PromptContext = createContext();

// EXPORT THE CUSTOM HOOK
export const usePrompts = () => {
  return useContext(PromptContext);
};

export const PromptProvider = ({ children }) => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (user) {
      fetchPrompts();
    } else {
      setPrompts([]);
      setPrompt(''); // Clear prompt on logout
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
};

