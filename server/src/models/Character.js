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
  return 10000 + (this.baseEndurance * 10);
};

// Метод для получения текущего здоровья с учетом регенерации
characterSchema.methods.getCurrentHealth = function() {
  const now = new Date();
  const secondsSinceLastUpdate = Math.max(0, (now - this.lastHealthUpdate) / 1000);
  const regenRate = this.getHealthRegenRate();
  const regenAmount = regenRate * secondsSinceLastUpdate;
  const maxHealth = this.getMaxHealth();
  const newHealth = Math.min(this.health + regenAmount, maxHealth);
  
  return Math.round(newHealth * 100) / 100;
};

// Метод для получения скорости регенерации здоровья
characterSchema.methods.getHealthRegenRate = function() {
  const maxHealth = this.getMaxHealth();
  return maxHealth / this.fullRegenTimeInSeconds;
};

// Метод для обновления здоровья
characterSchema.methods.updateHealth = function (newHealth) {
  this.health = Math.min(newHealth, this.getMaxHealth());
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

// Виртуальное поле для рассчитываемых характеристик
characterSchema.virtual('calculatedStats').get(function () {
  const maxHealth = this.getMaxHealth();
  return {
    strength: this.baseStrength, // + бонусы от экипировки и навыков
    dexterity: this.baseDexterity, // + бонусы
    intelligence: this.baseIntelligence, // + бонусы
    endurance: this.baseEndurance, // + бонусы
    charisma: this.baseCharisma, // + бонусы
    health: this.getCurrentHealth(),
    maxHealth: maxHealth,
    damage: this.baseStrength * 2, // Пример расчета урона
    armor: this.baseEndurance, // Пример расчета брони
    criticalChance: this.baseDexterity * 0.1, // Пример расчета шанса крита
    criticalDamage: 150 + this.baseStrength, // Пример расчета силы крита
    dodge: this.baseDexterity * 0.2, // Пример расчета уворота
    healthRegen: this.getHealthRegenRate(), // Скорость регенерации здоровья
    counterAttack: this.baseDexterity * 0.5 // Пример расчета шанса контратаки
  };
});

// Метод для получения максимального количества слотов навыков
characterSchema.methods.getMaxSkillSlots = function () {
  return Math.floor(this.level / 5) + 3; // Базовые 3 слота + 1 слот каждые 5 уровней
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