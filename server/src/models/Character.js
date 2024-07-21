  const mongoose = require('mongoose');

  const characterSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nickname: { type: String, required: true },
    class: { type: String, enum: ['Warrior', 'Mage', 'Archer'], required: true },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    status: { type: String, enum: ['idle', 'in_battle', 'resting'], default: 'idle' },

    // Базовые характеристики
    baseStrength: { type: Number, default: 10 },
    baseDexterity: { type: Number, default: 10 },
    baseIntelligence: { type: Number, default: 10 },
    baseEndurance: { type: Number, default: 10 },
    baseCharisma: { type: Number, default: 10 },

    // Здоровье
    health: { type: Number, default: function () { return this.getMaxHealth(); } },
    maxHealth: { type: Number, default: function () { return this.getMaxHealth(); } },
    lastHealthUpdate: { type: Date, default: Date.now },
    fullRegenTime: { type: Number, default: 600 }, // значение в секундах

    // Очки характеристик
    availablePoints: { type: Number, default: 5 },

    // Инвентарь
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CharItem' }],

    version: { type: Number, default: 0 }
  }, { timestamps: true });

  // Виртуальное поле для проверки завершения распределения очков
  characterSchema.virtual('zeroPoints').get(function () {
    return this.availablePoints === 0;
  });

  // Виртуальное поле для скорости регенерации здоровья
  characterSchema.virtual('healthRegenRate').get(function () {
    return this.getHealthRegenRate();
  });

  characterSchema.methods = {
    // Метод для получения максимального здоровья
    getMaxHealth() {
      const healthPerEndurance = 5;
      const baseHealth = 100 * this.level;
      const { enduranceBonus, healthBonus } = this.inventory
        .filter(charItem => charItem.isEquipped && charItem.gameItem && charItem.gameItem.stats)
        .reduce((acc, charItem) => ({
          enduranceBonus: acc.enduranceBonus + (charItem.gameItem.stats.endurance || 0),
          healthBonus: acc.healthBonus + (charItem.gameItem.stats.health || 0)
        }), { enduranceBonus: 0, healthBonus: 0 });

      return Math.round(baseHealth + (this.baseEndurance + enduranceBonus) * healthPerEndurance + healthBonus);
    },

    // Метод для получения скорости регенерации здоровья
    getHealthRegenRate() {
      return this.maxHealth / this.fullRegenTime;
    },

    // Метод для получения текущего здоровья с учетом регенерации
    getCurrentHealth() {
      return this.calculateUpdatedHealth(this.maxHealth);
    },

    // Метод для получения текущих данных о здоровье
    getHealthData() {
      return {
        currentHealth: this.getCurrentHealth(),
        maxHealth: this.maxHealth,
        healthRegenRate: this.getHealthRegenRate(),
        lastHealthUpdate: this.lastHealthUpdate
      };
    },

    // Метод для пересчета всех характеристик
    getStatsData() {
      const baseStats = {
        strength: this.baseStrength,
        dexterity: this.baseDexterity,
        intelligence: this.baseIntelligence,
        endurance: this.baseEndurance,
        charisma: this.baseCharisma
      };

      const equippedStats = this.inventory
        .filter(charItem => charItem.isEquipped && charItem.gameItem && charItem.gameItem.stats)
        .reduce((acc, charItem) => {
          Object.keys(charItem.gameItem.stats).forEach(stat => {
            if (baseStats.hasOwnProperty(stat)) {
              acc[stat] = (acc[stat] || 0) + charItem.gameItem.stats[stat];
            }
          });
          return acc;
        }, {});

      const totalStats = Object.keys(baseStats).reduce((acc, stat) => {
        acc[stat] = baseStats[stat] + (equippedStats[stat] || 0);
        return acc;
      }, {});

      // Формулы расчёта боевых характеристик
      return {
        ...totalStats,
        health: this.getCurrentHealth(),
        maxHealth: this.maxHealth,
        healthRegenRate: parseFloat(this.getHealthRegenRate().toFixed(2)),
        damage: Math.round(totalStats.strength * 1.5 + totalStats.intelligence * 0.5),
        armor: Math.round(totalStats.endurance * 0.5),
        criticalChance: parseFloat((totalStats.intelligence * 0.2).toFixed(2)),
        criticalDamage: Math.round(100 + totalStats.intelligence * 2),
        dodge: parseFloat((totalStats.dexterity * 0.3).toFixed(2)),
        counterAttack: parseFloat((totalStats.dexterity * 0.2 + totalStats.charisma * 0.1).toFixed(2)),
      };
    },

    // Новый метод для расчета обновленного здоровья
    calculateUpdatedHealth(newMaxHealth) {
      const now = new Date();
      const oldMaxHealth = this.maxHealth;
      const oldHealth = this.health;

      // Случай (a): текущее здоровье равно старому максимуму
      if (oldHealth === oldMaxHealth) {
        return oldHealth;
      }

      // Случай (b): текущее здоровье не равно старому максимуму
      const timeSinceLastUpdate = (now - this.lastHealthUpdate) / 1000; // в секундах
      const healthRegenRate = this.getHealthRegenRate();
      const regenAmount = healthRegenRate * timeSinceLastUpdate;

      // Рассчитываем новое здоровье и ограничиваем его старым и новым максимумами
      const updatedHealth = Math.min(
        Math.min(oldHealth + regenAmount, oldMaxHealth),
        newMaxHealth
      );

      return Math.round(updatedHealth);
    },

    // Обновленный метод для обновления здоровья после изменений
    updateHealthAfterChange(newMaxHealth) {
      const updatedHealth = this.calculateUpdatedHealth(newMaxHealth);

      this.health = updatedHealth;
      this.maxHealth = newMaxHealth;
      this.lastHealthUpdate = new Date();
    },
  };

  // Пре-сохранение для увеличения версии и обновления здоровья
  characterSchema.pre('save', function (next) {
    if (this.isNew) {
      this.health = this.getMaxHealth();
      this.maxHealth = this.getMaxHealth();
    } else {
      const newMaxHealth = this.getMaxHealth();
      this.updateHealthAfterChange(newMaxHealth);
    }

    if (this.isModified('baseStrength') ||
      this.isModified('baseDexterity') ||
      this.isModified('baseIntelligence') ||
      this.isModified('baseEndurance') ||
      this.isModified('baseCharisma') ||
      this.isModified('inventory')) {
      this.version += 1;
    }

    next();
  });

  module.exports = mongoose.model('Character', characterSchema);