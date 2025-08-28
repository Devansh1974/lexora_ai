const mongoose = require('mongoose');
const { Schema } = mongoose;

const promptSchema = new Schema({
  title: { type: String, required: true },
  promptText: { type: String, required: true },
  // This will be null for default prompts and will contain
  // the user's ID for their custom-saved prompts.
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

mongoose.model('Prompt', promptSchema);
