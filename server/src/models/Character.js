const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nickname: {
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
  gold: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['idle', 'in_battle', 'resting'],
    default: 'idle'
  },

  // Базовые характеристики
  baseStrength: { type: Number, default: 10 },
  baseDexterity: { type: Number, default: 10 },
  baseIntelligence: { type: Number, default: 10 },
  baseEndurance: { type: Number, default: 10 },
  baseCharisma: { type: Number, default: 10 },

  // Здоровье
  health: {
    type: Number,
    default: function () {
      return this.getMaxHealth();
    }
  },
  lastHealthUpdate: { type: Date, default: Date.now },
  fullRegenTimeInSeconds: { type: Number, default: 600 }, // 10 минут по умолчанию

  // Очки характеристик
  availablePoints: { type: Number, default: 5 },

  // Инвентарь
  inventory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CharItem'
  }],

  version: { type: Number, default: 0 }
}, { timestamps: true });

// Виртуальное поле для проверки завершения распределения очков
characterSchema.virtual('finalDistribution').get(function () {
  return this.availablePoints === 0;
});

// Метод для получения максимального здоровья
characterSchema.methods.getMaxHealth = function() {
  const baseHealth = 100 + (this.baseEndurance * 10);
  const bonusHealth = this.inventory
    .filter(charItem => charItem.isEquipped)
    .reduce((sum, charItem) => sum + (charItem.gameItem?.stats?.health || 0), 0);
  return Math.round(baseHealth + bonusHealth);
};

// Метод для получения текущего здоровья с учетом регенерации
characterSchema.methods.getCurrentHealth = function() {
  const now = new Date();
  const secondsSinceLastUpdate = Math.max(0, (now - this.lastHealthUpdate) / 1000);
  const regenRate = this.getHealthRegenRate();
  const regenAmount = regenRate * secondsSinceLastUpdate;
  const maxHealth = this.getMaxHealth();
  const newHealth = Math.min(this.health + regenAmount, maxHealth);
  
  return Math.round(newHealth);
};

// Метод для получения скорости регенерации здоровья
characterSchema.methods.getHealthRegenRate = function() {
  const baseRegen = this.getMaxHealth() * 0.01;
  const bonusRegen = this.baseIntelligence * 0.1;
  const equipmentRegen = this.inventory
    .filter(charItem => charItem.isEquipped)
    .reduce((sum, charItem) => sum + (charItem.gameItem?.stats?.healthRegen || 0), 0);
  return baseRegen + bonusRegen + equipmentRegen;
};

// Метод для обновления здоровья
characterSchema.methods.updateHealth = function (newHealth) {
  this.health = Math.min(Math.round(newHealth), this.getMaxHealth());
  this.lastHealthUpdate = new Date();
};

// Метод для получения данных о здоровье
characterSchema.methods.getHealthData = function () {
  const currentHealth = this.getCurrentHealth();
  const maxHealth = this.getMaxHealth();
  const regenRate = this.getHealthRegenRate();

  return {
    currentHealth,
    maxHealth,
    regenRate,
    lastUpdate: this.lastHealthUpdate
  };
};

// Метод для пересчета всех характеристик
characterSchema.methods.recalculateStats = function() {
  const equippedCharItems = this.inventory.filter(charItem => charItem.isEquipped);
  
  const baseStats = {
    strength: this.baseStrength,
    dexterity: this.baseDexterity,
    intelligence: this.baseIntelligence,
    endurance: this.baseEndurance,
    charisma: this.baseCharisma
  };

  console.log('Base stats:', baseStats);

  equippedCharItems.forEach(charItem => {
    if (charItem.gameItem && charItem.gameItem.stats) {
      Object.keys(charItem.gameItem.stats).forEach(stat => {
        if (baseStats.hasOwnProperty(stat)) {
          baseStats[stat] += charItem.gameItem.stats[stat];
        }
      });
    }
  });

  console.log('Stats after equipment:', baseStats);

  const health = this.getCurrentHealth();
  const maxHealth = this.getMaxHealth();

  this.calculatedStats = {
    ...baseStats,
    health,
    maxHealth,
    damage: Math.round(baseStats.strength * 1.5 + baseStats.intelligence * 0.5),
    armor: Math.round(baseStats.endurance * 0.5),
    criticalChance: parseFloat((baseStats.intelligence * 0.2).toFixed(2)),
    criticalDamage: Math.round(100 + baseStats.intelligence * 2),
    dodge: parseFloat((baseStats.dexterity * 0.3).toFixed(2)),
    counterAttack: parseFloat((baseStats.dexterity * 0.2 + baseStats.charisma * 0.1).toFixed(2)),
    healthRegen: parseFloat(this.getHealthRegenRate().toFixed(2))
  };

  console.log('Calculated stats:', this.calculatedStats);

  return this.calculatedStats;
};

// Метод для обновления здоровья после экипировки/снятия предмета
characterSchema.methods.updateHealthAfterEquip = function(oldMaxHealth) {
  const newMaxHealth = this.getMaxHealth();
  if (newMaxHealth < oldMaxHealth) {
    const ratio = newMaxHealth / oldMaxHealth;
    this.health = Math.round(this.health * ratio);
  }
  this.lastHealthUpdate = new Date();
};

// Пре-сохранение для увеличения версии и обновления здоровья
characterSchema.pre('save', function(next) {
  if (this.isNew) {
    this.health = this.getMaxHealth();
  }
  
  if (this.isModified('baseStrength') ||
      this.isModified('baseDexterity') ||
      this.isModified('baseIntelligence') ||
      this.isModified('baseEndurance') ||
      this.isModified('baseCharisma') ||
      this.isModified('inventory')) {
    this.version += 1;
  }
  
  this.updateHealth(this.getCurrentHealth());
  next();
});

module.exports = mongoose.model('Character', characterSchema);