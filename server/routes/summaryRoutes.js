const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const { google } = require('googleapis');
const multer = require('multer');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');

const Summary = mongoose.model('Summary');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = app => {
  // GET all summaries for the logged-in user
  app.get('/api/summaries', requireLogin, async (req, res) => {
    const summaries = await Summary.find({ _user: req.user.id }).sort({ createdAt: -1 });
    res.send(summaries);
  });

  // GET a single public summary by its shareId
  app.get('/api/summaries/:shareId', async (req, res) => {
    const summary = await Summary.findOne({ shareId: req.params.shareId });
    if (!summary) {
      return res.status(404).send({ error: 'Summary not found.' });
    }
    res.send(summary);
  });

  // POST to generate a new summary (NOW WITH AI-POWERED TITLING)
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

      // --- NEW: AI Title Generation ---
      let generatedTitle = 'Untitled Summary'; // Default title
      try {
        const titleResponse = await groq.chat.completions.create({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'You are an expert at creating short, descriptive titles.' },
            { role: 'user', content: `Analyze the following text and create a concise title for it, no more than 7 words. Text: "${originalContent.substring(0, 1000)}"` },
          ],
        });
        generatedTitle = titleResponse.choices[0].message.content.replace(/"/g, ''); // Remove quotes
      } catch (titleError) {
        console.error("Could not generate AI title, using default.", titleError);
      }
      
      // --- Main Summarization ---
      const summaryResponse = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes meeting transcripts.' },
          { role: 'user', content: `Instruction: "${prompt}". Transcript: "${originalContent}"` },
        ],
      });

      const summaryText = summaryResponse.choices[0].message.content;

      const newSummary = new Summary({
        title: generatedTitle, // Use the new AI-generated title
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
  
  // --- NEW: PATCH route to update a summary's title ---
  app.patch('/api/summaries/:id', requireLogin, async (req, res) => {
    const { title } = req.body;
    const { id } = req.params;

    if (!title) {
      return res.status(400).send({ error: 'Title is required.' });
    }
    
    try {
      const summary = await Summary.findOne({ _id: id, _user: req.user.id });

      if (!summary) {
        return res.status(404).send({ error: 'Summary not found or you do not have permission to edit it.' });
      }

      summary.title = title;
      await summary.save();
      res.send(summary);
    } catch (error) {
      console.error('Error updating title:', error);
      res.status(500).send({ error: 'Failed to update summary title.' });
    }
  });

  // POST to share a summary via email
  app.post('/api/share', requireLogin, async (req, res) => {
    const { summary, recipient } = req.body;
    if (!summary || !recipient) {
      return res.status(400).json({ error: 'Summary and recipient are required.' });
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        '/auth/google/callback'
      );

      oauth2Client.setCredentials({
        access_token: req.user.accessToken,
        refresh_token: req.user.refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const rawMessage = [
        `From: ${req.user.email}`,
        `To: ${recipient}`,
        `Subject: Your LexoraAI Meeting Summary`,
        '',
        summary,
      ].join('\n');
      
      const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      res.send({ message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error sending email via Gmail API:', error);
      res.status(500).send({ error: 'Failed to send email.' });
    }
  });
};
