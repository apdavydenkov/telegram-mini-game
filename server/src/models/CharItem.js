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
  equippedQuantity: {
    type: Number,
    default: 0
  },
  isEquipped: {
    type: Boolean,
    default: false
  },
  slot: {
    type: String,
    enum: ['weapon', 'armor', 'helmet', 'shield', 'cloak', 'boots', 'belt', 'banner', 'useful1', 'useful2', 'useful3', null],
    default: null
  }
}, { timestamps: true });

// Метод для экипировки предмета
charItemSchema.methods.setEquippedStatus = function (isEquipped) {
  this.isEquipped = isEquipped;
  if (!isEquipped) {
    this.slot = null;
  }
  return this.save();
};

module.exports = mongoose.model('CharItem', charItemSchema);  