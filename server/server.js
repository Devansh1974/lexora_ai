const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// --- Model Imports ---
require('./models/User');
require('./models/Summary');
require('./models/Prompt'); // This is already here

// --- Service Imports ---
require('./services/passport');

const app = express();

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.COOKIE_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected.');
    seedDefaultPrompts(); // --- ADDED THIS LINE ---
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- NEW: Database Seeding Function ---
const Prompt = mongoose.model('Prompt');
const seedDefaultPrompts = async () => {
  try {
    const defaultPrompts = [
      { title: 'Executive Summary', promptText: 'Summarize the following transcript into a concise executive summary, highlighting the key decisions and outcomes. Format the output as clean markdown.' },
      { title: 'Action Items', promptText: 'Extract all action items from the transcript. List them as a markdown checklist with assigned owners if mentioned.' },
      { title: 'Bullet Points', promptText: 'Condense the key topics of this meeting into a series of clear and concise markdown bullet points.' },
      { title: 'Follow-up Email', promptText: 'Draft a professional follow-up email to all attendees based on the transcript. Include a brief summary, a list of action items with owners, and a concluding remark.' },
      { title: 'Key Questions', promptText: 'Identify and list all unresolved questions or topics that require further discussion from the transcript.' }
    ];

    // Check if any default prompts already exist
    const existingPrompts = await Prompt.countDocuments({ _user: null });
    if (existingPrompts === 0) {
      console.log('No default prompts found. Seeding database...');
      await Prompt.insertMany(defaultPrompts);
      console.log('Default prompts have been seeded.');
    } else {
      console.log('Default prompts already exist.');
    }
  } catch (error) {
    console.error('Error seeding default prompts:', error);
  }
};


// --- Route Imports ---
require('./routes/authRoutes')(app);
require('./routes/summaryRoutes')(app);
require('./routes/promptRoutes')(app);

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
