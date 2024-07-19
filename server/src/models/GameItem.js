const mongoose = require('mongoose');
const gameItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['weapon', 'armor', 'banner', 'helmet', 'shield', 'cloak', 'belt', 'boots', 'useful'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  minLevel: { type: Number, default: 1 },
  requiredClass: [{
    type: String,
    enum: ['Warrior', 'Mage', 'Archer']
  }],
  requiredStats: {
    strength: { type: Number, default: 0 },
    dexterity: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    endurance: { type: Number, default: 0 },
    charisma: { type: Number, default: 0 }
  },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
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
    counterAttack: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    healthRegenRate: { type: Number, default: 0 }
  }
});

module.exports = mongoose.models.GameItem || mongoose.model('GameItem', gameItemSchema);