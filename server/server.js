// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- AI Service Configuration (Groq) ---
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// --- API Endpoints ---
// The /api/summarize endpoint is unchanged...
app.post('/api/summarize', async (req, res) => {
  const { transcript, prompt } = req.body;
  if (!transcript || !prompt) {
    return res.status(400).json({ error: 'Transcript and prompt are required.' });
  }
  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes meeting transcripts.' },
        { role: 'user', content: `Instruction: "${prompt}". Transcript: "${transcript}"` },
      ],
    });
    const summary = response.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('Error with Groq API:', error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});


// Endpoint to share the summary via email
app.post('/api/share', async (req, res) => {
  const { summary, recipient } = req.body;

  if (!summary || !recipient) {
    return res.status(400).json({ error: 'Summary and recipient email are required.' });
  }

  // --- FINAL Nodemailer Configuration (Using Port 587) ---
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Switched to port 587
    secure: false, // Must be false for port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Your App Password
    },
    requireTLS: true // Enforce TLS
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: 'Your Meeting Summary',
    text: summary,
  };

  try {
    // Added a log to confirm email is being sent
    console.log('Attempting to send email to:', recipient);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});