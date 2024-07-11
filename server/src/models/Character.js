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
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  // Базовые характеристики
  strength: { type: Number, default: 10 },
  dexterity: { type: Number, default: 10 },
  intelligence: { type: Number, default: 10 },
  endurance: { type: Number, default: 10 },
  charisma: { type: Number, default: 10 },
  // Расчетные характеристики (будут вычисляться)
  damage: { type: Number, default: 0 },
  armor: { type: Number, default: 0 },
  criticalChance: { type: Number, default: 0 },
  criticalDamage: { type: Number, default: 0 },
  dodge: { type: Number, default: 0 },
  healthRegen: { type: Number, default: 0 },
  health: { type: Number, default: 100 },
  counterAttack: { type: Number, default: 0 },
  // Очки характеристик
  availablePoints: { type: Number, default: 5 },
  finalDistribution: { type: Boolean, default: false },
  // Инвентарь
  inventory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 }
  }],
  // Экипировка
  equipment: {
    weapon: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    armor: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    helmet: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    shield: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    cloak: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    boots: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    belt: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    accessory: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    banner: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }
  },
  version: { type: Number, default: 0 }
}, { timestamps: true });

// Функция для пересчета характеристик
characterSchema.methods.recalculateStats = function() {
  // Базовые значения
  this.damage = this.strength * 2;
  this.armor = this.endurance;
  this.criticalChance = this.dexterity * 0.1;
  this.criticalDamage = 150 + this.strength;
  this.dodge = this.dexterity * 0.2;
  this.healthRegen = this.endurance * 0.1;
  this.health = 100 + (this.endurance * 10);
  this.counterAttack = this.dexterity * 0.5;

  // Добавление бонусов от экипировки
  Object.values(this.equipment).forEach(item => {
    if (item && item.stats) {
      this.damage += item.stats.damage || 0;
      this.armor += item.stats.armor || 0;
      this.criticalChance += item.stats.criticalChance || 0;
      this.criticalDamage += item.stats.criticalDamage || 0;
      this.dodge += item.stats.dodge || 0;
      this.healthRegen += item.stats.healthRegen || 0;
      this.health += item.stats.health || 0;
      this.counterAttack += item.stats.counterAttack || 0;
    }
  });
};

characterSchema.pre('save', function(next) {
  this.version += 1;
  this.recalculateStats();
  next();
});

module.exports = mongoose.model('Character', characterSchema);