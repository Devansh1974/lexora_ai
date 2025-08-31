const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const { google } = require('googleapis');
const multer = require('multer');
const mammoth = require('mammoth');
// --- NEW: Import Google Gemini ---
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Summary = mongoose.model('Summary');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- NEW: Initialize Google Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

module.exports = app => {
  // GET all summaries for the logged-in user
  app.get('/api/summaries', requireLogin, async (req, res) => {
    try {
      const summaries = await Summary.find({ _user: req.user.id }).sort({ createdAt: -1 });
      res.send(summaries);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      res.status(500).send({ error: 'Failed to fetch summaries.' });
    }
  });

  // GET a single public summary by its shareId
  app.get('/api/summaries/:shareId', async (req, res) => {
    try {
      const summary = await Summary.findOne({ shareId: req.params.shareId });
      if (!summary) {
        return res.status(404).send({ error: 'Summary not found.' });
      }
      res.send(summary);
    } catch (error) {
      console.error('Error fetching shared summary:', error);
      res.status(500).send({ error: 'Failed to fetch summary.' });
    }
  });

  // POST to generate a new summary
  app.post('/api/summarize', requireLogin, upload.single('file'), async (req, res) => {
    try {
      const { prompt } = req.body;
      let originalContent = req.body.transcript;

      if (req.file) {
        if (req.file.mimetype === 'text/plain') {
          originalContent = req.file.buffer.toString('utf8');
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          originalContent = result.value;
        } else {
          return res.status(400).json({ error: 'Unsupported file type.' });
        }
      }

      if (!originalContent || !prompt) {
        return res.status(400).json({ error: 'Transcript and prompt are required.' });
      }

      let generatedTitle = 'Untitled Summary';
      try {
        const titlePrompt = `Analyze the following text and create a concise title for it, no more than 7 words. Text: "${originalContent.substring(0, 1500)}"`;
        const titleResult = await model.generateContent(titlePrompt);
        const titleResponse = await titleResult.response;
        generatedTitle = titleResponse.text().replace(/"/g, '');
      } catch (titleError) {
        console.error("Could not generate AI title, using default.", titleError);
      }
      
      const summaryPrompt = `Instruction: "${prompt}". Transcript: "${originalContent}"`;
      const summaryResult = await model.generateContent(summaryPrompt);
      const summaryResponse = await summaryResult.response;
      const summaryText = summaryResponse.text();

      const newSummary = new Summary({
        title: generatedTitle,
        originalContent,
        prompt,
        summaryText,
        _user: req.user.id
      });
      await newSummary.save();
      res.send(newSummary);

    } catch (error) {
      console.error('Error in /api/summarize:', error);
      res.status(500).send({ error: 'Failed to generate summary.' });
    }
  });
  
  // PATCH route to update a summary's title
  app.patch('/api/summaries/:id', requireLogin, async (req, res) => {
    const { title } = req.body;
    const { id } = req.params;
    if (!title) { return res.status(400).send({ error: 'Title is required.' }); }
    try {
      const summary = await Summary.findOneAndUpdate({ _id: id, _user: req.user.id }, { title }, { new: true });
      if (!summary) { return res.status(404).send({ error: 'Summary not found or you do not have permission to edit it.' }); }
      res.send(summary);
    } catch (error) { 
      console.error('Error updating title:', error);
      res.status(500).send({ error: 'Failed to update summary title.' });
    }
  });

  // POST route to refine an existing summary
  app.post('/api/summaries/refine', requireLogin, async (req, res) => {
    const { currentSummary, refinementPrompt } = req.body;
    if (!currentSummary || !refinementPrompt) {
      return res.status(400).send({ error: 'Current summary and refinement prompt are required.' });
    }

    try {
      const prompt = `You are an expert editor. Refine the following summary based on the user's instruction. Only output the refined text, without any extra commentary.\n\nOriginal Summary: "${currentSummary}".\n\nMy Instruction: "${refinementPrompt}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const refinedText = response.text();
      res.send({ refinedText });
    } catch (error) {
      console.error('Error refining summary:', error);
      res.status(500).send({ error: 'Failed to refine summary.' });
    }
  });

  // PATCH route to save the final refined summary text
  app.patch('/api/summaries/:id/text', requireLogin, async (req, res) => {
    const { summaryText } = req.body;
    const { id } = req.params;
    if (!summaryText) { return res.status(400).send({ error: 'Summary text is required.' }); }
    try {
      const summary = await Summary.findOneAndUpdate({ _id: id, _user: req.user.id }, { summaryText }, { new: true });
      if (!summary) { return res.status(404).send({ error: 'Summary not found or you do not have permission to save it.' }); }
      res.send(summary);
    } catch (error) { 
      console.error('Error saving refined summary:', error);
      res.status(500).send({ error: 'Failed to save changes.' });
    }
  });

  // POST to share a summary via email
  app.post('/api/share', requireLogin, async (req, res) => {
    const { summary, recipient } = req.body;
    if (!summary || !recipient) { return res.status(400).json({ error: 'Summary and recipient are required.' }); }
    try {
      const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, '/auth/google/callback');
      oauth2Client.setCredentials({ access_token: req.user.accessToken, refresh_token: req.user.refreshToken });
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const rawMessage = [`From: ${req.user.email}`, `To: ${recipient}`, `Subject: Your LexoraAI Meeting Summary`, '', summary].join('\n');
      const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } });
      res.send({ message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error sending email via Gmail API:', error);
      res.status(500).send({ error: 'Failed to send email.' });
    }
  });
};

