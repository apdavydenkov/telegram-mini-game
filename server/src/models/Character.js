const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ['Warrior', 'Mage', 'Archer'],
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  health: {
    type: Number,
    default: 100
  },
  maxHealth: {
    type: Number,
    default: 100
  },
  strength: {
    type: Number,
    default: 10
  },
  dexterity: {
    type: Number,
    default: 10
  },
  intelligence: {
    type: Number,
    default: 10
  },
  endurance: {
    type: Number,
    default: 10
  },
  charisma: {
    type: Number,
    default: 10
  },
  availablePoints: {
    type: Number,
    default: 5
  },
  finalDistribution: {
    type: Boolean,
    default: false
  },
  inventory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 }
  }],
  equipment: {
    hand: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    body: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    feet: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    accessory: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }
  },
  version: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

characterSchema.pre('save', function(next) {
  this.version += 1;
  next();
});

module.exports = mongoose.model('Character', characterSchema);