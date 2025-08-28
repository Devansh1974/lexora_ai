const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');

const Prompt = mongoose.model('Prompt');

module.exports = app => {
  // GET route to fetch all prompts (default and user-specific)
  app.get('/api/prompts', requireLogin, async (req, res) => {
    try {
      // Find all default prompts (where _user is null) OR
      // prompts created by the current user.
      const prompts = await Prompt.find({
        $or: [{ _user: null }, { _user: req.user.id }]
      }).sort({ createdAt: 1 }); // Sort them to keep a consistent order

      res.send(prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      res.status(500).send({ error: 'Failed to fetch prompts.' });
    }
  });

  // POST route to save a new custom prompt
  app.post('/api/prompts', requireLogin, async (req, res) => {
    const { title, promptText } = req.body;

    if (!title || !promptText) {
      return res.status(400).send({ error: 'Title and prompt text are required.' });
    }

    try {
      const newPrompt = new Prompt({
        title,
        promptText,
        _user: req.user.id // Link the prompt to the logged-in user
      });

      await newPrompt.save();
      res.send(newPrompt);
    } catch (error) {
      console.error('Error saving prompt:', error);
      res.status(500).send({ error: 'Failed to save custom prompt.' });
    }
  });

  // DELETE route to remove a custom prompt
  app.delete('/api/prompts/:id', requireLogin, async (req, res) => {
    try {
      const prompt = await Prompt.findOneAndDelete({
        _id: req.params.id,
        _user: req.user.id // Ensure users can only delete their own prompts
      });

      if (!prompt) {
        return res.status(404).send({ error: 'Prompt not found or you do not have permission to delete it.' });
      }

      res.send(prompt);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      res.status(500).send({ error: 'Failed to delete prompt.' });
    }
  });
};
