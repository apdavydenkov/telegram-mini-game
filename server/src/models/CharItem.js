const mongoose = require('mongoose');

const charItemSchema = new mongoose.Schema({
  gameItem: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GameItem', 
    required: true 
  },
  character: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Character', 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1 
  },
  isEquipped: { 
    type: Boolean, 
    default: false 
  },
  slot: { 
    type: String, 
    enum: ['weapon', 'armor', 'helmet', 'shield', 'cloak', 'boots', 'belt', 'accessory', 'banner', null],
    default: null
  }
}, { timestamps: true });

// Метод для экипировки предмета
charItemSchema.methods.equip = function() {
  this.isEquipped = true;
  return this.save();
};

// Метод для снятия предмета
charItemSchema.methods.unequip = function() {
  this.isEquipped = false;
  this.slot = null;
  return this.save();
};

module.exports = mongoose.model('CharItem', charItemSchema);