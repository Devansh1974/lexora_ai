const mongoose = require('mongoose');
const { Schema } = mongoose;
const shortid = require('shortid');

const summarySchema = new Schema({
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, default: 'Untitled Summary' }, 
  originalContent: String,
  prompt: String,
  summaryText: String,
  shareId: { type: String, default: shortid.generate, unique: true },
  createdAt: { type: Date, default: Date.now }
});

mongoose.model('Summary', summarySchema);
