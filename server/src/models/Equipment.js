// models/Equipment.js
const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['weapon', 'armor', 'accessory', 'banner', 'helmet', 'shield', 'cloak', 'belt', 'boots'], 
    required: true 
  },
  stats: {
    strength: { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    endurance: { type: Number, default: 0 },
    charisma: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    dodge: { type: Number, default: 0 },
    criticalChance: { type: Number, default: 0 },
    criticalDamage: { type: Number, default: 0 }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  minLevel: { type: Number, default: 1 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);