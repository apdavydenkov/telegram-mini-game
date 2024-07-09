const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['weapon', 'armor', 'accessory'], 
    required: true 
  },
  slot: { 
    type: String, 
    enum: ['hand', 'body', 'head', 'feet', 'accessory'], 
    required: true 
  },
  stats: {
    strength: { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    health: { type: Number, default: 0 }
  },
  description: { type: String }
});

module.exports = mongoose.model('Item', itemSchema);