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
  maxHealth: { type: Number, default: 100 },
  health: { type: Number, default: 100 },
  lastHealthUpdate: { type: Date, default: Date.now },
  fullRegenTimeInSeconds: { type: Number, default: 600 }, // 10 минут по умолчанию
  
  // Очки характеристик
  availablePoints: { type: Number, default: 5 },
  
  // Инвентарь
  inventory: [{
    charItem: { type: mongoose.Schema.Types.ObjectId, ref: 'CharItem' },
    quantity: { type: Number, default: 1 }
  }],
  
  // Экипировка
  equipment: {
    weapon: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    armor: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    helmet: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    shield: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    cloak: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    boots: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    belt: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    accessory: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' },
    banner: { type: mongoose.Schema.Types.ObjectId, ref: 'GameItem' }
  },
  
  version: { type: Number, default: 0 }
}, { timestamps: true });

// Виртуальное поле для проверки завершения распределения очков
characterSchema.virtual('finalDistribution').get(function() {
  return this.availablePoints === 0;
});

// Метод для получения базовых характеристик
characterSchema.methods.getBaseStats = function() {
  return {
    strength: this.baseStrength,
    dexterity: this.baseDexterity,
    intelligence: this.baseIntelligence,
    endurance: this.baseEndurance,
    charisma: this.baseCharisma,
    maxHealth: this.maxHealth,
  };
};

// Метод для расчета модификаторов от экипировки
characterSchema.methods.getEquipmentModifiers = function() {
  const modifiers = {
    strength: 0,
    dexterity: 0,
    intelligence: 0,
    endurance: 0,
    charisma: 0,
    healthRegenModifier: 0,
    damage: 0,
    armor: 0,
    criticalChance: 0,
    criticalDamage: 0,
    dodge: 0,
    counterAttack: 0,
  };

  for (const [slot, itemId] of Object.entries(this.equipment)) {
    if (itemId) {
      const item = this.getEquippedItem(slot);
      if (item && item.stats) {
        for (const [stat, value] of Object.entries(item.stats)) {
          modifiers[stat] = (modifiers[stat] || 0) + value;
        }
      }
    }
  }

  return modifiers;
};

// Виртуальное поле для рассчитываемых характеристик
characterSchema.virtual('calculatedStats').get(function() {
  const baseStats = this.getBaseStats();
  const equipmentModifiers = this.getEquipmentModifiers();

  const stats = {
    strength: baseStats.strength + equipmentModifiers.strength,
    dexterity: baseStats.dexterity + equipmentModifiers.dexterity,
    intelligence: baseStats.intelligence + equipmentModifiers.intelligence,
    endurance: baseStats.endurance + equipmentModifiers.endurance,
    charisma: baseStats.charisma + equipmentModifiers.charisma,
    health: this.getCurrentHealth(),
    maxHealth: baseStats.maxHealth,
    damage: (baseStats.strength + equipmentModifiers.strength) * 2 + equipmentModifiers.damage,
    armor: baseStats.endurance + equipmentModifiers.endurance + equipmentModifiers.armor,
    criticalChance: (baseStats.dexterity + equipmentModifiers.dexterity) * 0.1 + equipmentModifiers.criticalChance,
    criticalDamage: 150 + baseStats.strength + equipmentModifiers.strength + equipmentModifiers.criticalDamage,
    dodge: (baseStats.dexterity + equipmentModifiers.dexterity) * 0.2 + equipmentModifiers.dodge,
    counterAttack: (baseStats.dexterity + equipmentModifiers.dexterity) * 0.5 + equipmentModifiers.counterAttack,
  };

  // Рассчитываем скорость регенерации здоровья
  const baseRegenRate = this.maxHealth / this.fullRegenTimeInSeconds;
  stats.healthRegenRate = baseRegenRate * (1 + (equipmentModifiers.healthRegenModifier || 0) / 100);

  return stats;
});

// Метод для получения текущего здоровья с учетом регенерации
characterSchema.methods.getCurrentHealth = function() {
  const now = new Date();
  const secondsSinceLastUpdate = Math.max(0, (now - this.lastHealthUpdate) / 1000);
  const regenRate = this.maxHealth / this.fullRegenTimeInSeconds;
  const regenAmount = regenRate * secondsSinceLastUpdate;
  const newHealth = Math.min(this.health + regenAmount, this.maxHealth);
  
  // Округляем до двух знаков после запятой
  return Math.round(newHealth * 100) / 100;
};

characterSchema.methods.updateHealth = function() {
  const currentHealth = this.getCurrentHealth();
  if (currentHealth !== this.health) {
    this.health = currentHealth;
    this.lastHealthUpdate = new Date();
  }
};

// Метод для получения максимального количества слотов навыков
characterSchema.methods.getMaxSkillSlots = function() {
  return Math.floor(this.level / 5) + 3; // Базовые 3 слота + 1 слот каждые 5 уровней
};

// Метод для получения экипированного предмета (заглушка, нужно реализовать)
characterSchema.methods.getEquippedItem = function(slot) {
  // Здесь должна быть логика получения экипированного предмета
  // Например, запрос к базе данных или к кэшу
  return null; // Заглушка
};

// Пре-сохранение для увеличения версии и обновления здоровья
characterSchema.pre('save', function(next) {
  if (this.isModified('baseStrength') ||
      this.isModified('baseDexterity') ||
      this.isModified('baseIntelligence') ||
      this.isModified('baseEndurance') ||
      this.isModified('baseCharisma') ||
      this.isModified('equipment') ||
      this.isModified('inventory')) {
    this.version += 1;
  }
  this.updateHealth();
  next();
});

module.exports = mongoose.model('Character', characterSchema);