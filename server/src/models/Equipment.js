const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['weapon', 'armor', 'accessory', 'banner', 'helmet', 'shield', 'cloak', 'belt', 'boots'], 
    required: true 
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  minLevel: { type: Number, default: 1 },
  image: { type: String, default: '' },
  stats: {
    strength: { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    endurance: { type: Number, default: 0 },
    charisma: { type: Number, default: 0 },
    damage: { type: Number, default: 0 },
    armor: { type: Number, default: 0 },
    criticalChance: { type: Number, default: 0 },
    criticalDamage: { type: Number, default: 0 },
    dodge: { type: Number, default: 0 },
    healthRegen: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    counterAttack: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Equipment', equipmentSchema);