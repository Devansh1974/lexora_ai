// backend/server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Groq = require('groq-sdk');
const multer = require('multer');
const mammoth = require('mammoth');
const mongoose = require('mongoose'); // Import mongoose
const shortid = require('shortid'); // Import shortid
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema and Model ---
const summarySchema = new mongoose.Schema({
  originalContent: { type: String, required: true },
  prompt: { type: String, required: true },
  summaryText: { type: String, required: true },
  shareId: { type: String, default: shortid.generate, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Summary = mongoose.model('Summary', summarySchema);

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- AI Service Configuration (Groq) ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- API Endpoints ---

// Modified /api/summarize to save to DB
app.post('/api/summarize', upload.single('file'), async (req, res) => {
  try {
    const { prompt } = req.body;
    let transcript = req.body.transcript;
    let originalContent = transcript;

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

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes meeting transcripts.' },
        { role: 'user', content: `Instruction: "${prompt}". Transcript: "${originalContent}"` },
      ],
    });

    const summaryText = response.choices[0].message.content;

    // --- Save the new summary to the database ---
    const newSummary = new Summary({
      originalContent,
      prompt,
      summaryText
    });
    await newSummary.save();

    // Send back the full summary object, including the shareId
    res.json(newSummary);

  } catch (error) {
    console.error('Error in /api/summarize:', error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// --- NEW Endpoints for History and Sharing ---

// GET all summaries (for history)
app.get('/api/summaries', async (req, res) => {
  try {
    const summaries = await Summary.find().sort({ createdAt: -1 }); // Most recent first
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summaries.' });
  }
});

// GET a single summary by its shareId
app.get('/api/summaries/:shareId', async (req, res) => {
  try {
    const summary = await Summary.findOne({ shareId: req.params.shareId });
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found.' });
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary.' });
  }
});

// The /api/share endpoint for email remains unchanged
app.post('/api/share', async (req, res) => {
  // ... (code for sending email is the same as before)
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});