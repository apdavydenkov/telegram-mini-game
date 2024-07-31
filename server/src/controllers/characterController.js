const Character = require('../models/Character');
const User = require('../models/User');
const GameItem = require('../models/GameItem');
const CharItem = require('../models/CharItem');

const getFullCharacterData = async (character) => ({
  ...character.toObject(),
  healthData: character.getHealthData(),
  calculatedStats: character.getStatsData(),
  status: character.status
});

const getCurrentCharacter = async (userId) => {
  const character = await Character.findOne({ user: userId }).populate({
    path: 'inventory',
    populate: { path: 'gameItem' }
  });
  return character; // Возвращаем null, если персонаж не найден
};

const handleError = (res, error, message) => {
  console.error(`${message}:`, error);
  res.status(400).json({ message, error: error.message });
};

exports.createCharacter = async (req, res) => {
  try {
    const { nickname, class: characterClass, baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma } = req.body;

    const totalStats = baseStrength + baseDexterity + baseIntelligence + baseEndurance + baseCharisma;
    const baseStats = 50;
    const basePoints = 5;

    if (totalStats - baseStats > basePoints) throw new Error('Неверное распределение характеристик');
    if (await Character.findOne({ user: req.user._id })) throw new Error('У пользователя уже есть персонаж');

    const character = await Character.create({
      user: req.user._id,
      nickname,
      class: characterClass,
      baseStrength,
      baseDexterity,
      baseIntelligence,
      baseEndurance,
      baseCharisma,
      availablePoints: basePoints - (totalStats - baseStats)
    });

    await User.findByIdAndUpdate(req.user._id, { hasCharacter: true });
    res.status(201).json(await getFullCharacterData(character));
  } catch (error) {
    handleError(res, error, 'Ошибка создания персонажа');
  }
};

// controllers/characterController.js

exports.getCharacter = async (req, res) => {
  try {
    const character = await getCurrentCharacter(req.user._id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found', hasCharacter: false });
    }

    // Обновляем health, maxHealth и lastHealthUpdate перед отправкой данных
    const currentHealth = character.getCurrentHealth();
    const maxHealth = character.getMaxHealth();
    character.health = currentHealth;
    character.maxHealth = maxHealth;
    character.lastHealthUpdate = new Date();
    await character.save();

    console.log('Server: Character health updated:', { health: currentHealth, maxHealth, lastHealthUpdate: character.lastHealthUpdate });

    res.json(await getFullCharacterData(character));
  } catch (error) {
    console.error('Server: Error getting character:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateCharacter = async (req, res) => {
  try {
    const { baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma, version } = req.body;
    const character = await getCurrentCharacter(req.user._id);

    if (character.version !== version) throw new Error('Конфликт версий. Обновите данные и попробуйте снова.');
    if (character.zeroPoints) throw new Error('Распределение очков уже завершено');

    const newTotalStats = baseStrength + baseDexterity + baseIntelligence + baseEndurance + baseCharisma;
    const oldTotalStats = character.baseStrength + character.baseDexterity + character.baseIntelligence + character.baseEndurance + character.baseCharisma;
    const pointsSpent = newTotalStats - oldTotalStats;

    if (pointsSpent > character.availablePoints || pointsSpent < 0) throw new Error('Недопустимое распределение очков');

    Object.assign(character, { baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma, availablePoints: character.availablePoints - pointsSpent });
    await character.save();

    res.json(await getFullCharacterData(character));
  } catch (error) {
    handleError(res, error, 'Ошибка обновления персонажа');
  }
};

exports.equipCharItem = async (req, res) => {
  try {
    const { charItemId, quantity = 1 } = req.body;
    const character = await getCurrentCharacter(req.user._id);

    const charItemToEquip = character.inventory.find(charItem => charItem._id.toString() === charItemId);
    if (!charItemToEquip || !charItemToEquip.gameItem) throw new Error('Предмет не найден в инвентаре или не содержит данных gameItem');

    const gameItemType = charItemToEquip.gameItem.type;

    if (charItemToEquip.isEquipped) {
      // Снятие предмета
      if (charItemToEquip.gameItem.isStackable) {
        charItemToEquip.equippedQuantity = Math.max(0, charItemToEquip.equippedQuantity - quantity);
        if (charItemToEquip.equippedQuantity === 0) {
          charItemToEquip.isEquipped = false;
          charItemToEquip.slot = null;
        }
      } else {
        charItemToEquip.isEquipped = false;
        charItemToEquip.slot = null;
      }
    } else {
      // Надевание предмета
      if (gameItemType === 'useful') {
        const usefulSlots = ['useful1', 'useful2', 'useful3'];
        let slotToEquip = null;

        for (const slot of usefulSlots) {
          const itemInSlot = character.inventory.find(item => item.isEquipped && item.slot === slot);
          if (!itemInSlot) {
            slotToEquip = slot;
            break;
          }
        }

        if (!slotToEquip) {
          // Если все слоты заняты, заменяем предмет в последнем слоте
          const itemToUnequip = character.inventory.find(item => item.isEquipped && item.slot === 'useful3');
          if (itemToUnequip) {
            itemToUnequip.isEquipped = false;
            itemToUnequip.slot = null;
            if (itemToUnequip.gameItem.isStackable) {
              itemToUnequip.equippedQuantity = 0;
            }
            await itemToUnequip.save();
          }
          slotToEquip = 'useful3';
        }

        charItemToEquip.slot = slotToEquip;
      } else {
        const equippedCharItem = character.inventory.find(charItem =>
          charItem.isEquipped && charItem.gameItem && charItem.gameItem.type === gameItemType
        );
        if (equippedCharItem) {
          equippedCharItem.isEquipped = false;
          equippedCharItem.slot = null;
          if (equippedCharItem.gameItem.isStackable) {
            equippedCharItem.equippedQuantity = 0;
          }
          await equippedCharItem.save();
        }
        charItemToEquip.slot = gameItemType;
      }

      charItemToEquip.isEquipped = true;
      if (charItemToEquip.gameItem.isStackable) {
        charItemToEquip.equippedQuantity = Math.min(quantity, charItemToEquip.quantity);
      }
    }

    await charItemToEquip.save();
    await character.save();

    res.json(await getFullCharacterData(character));
  } catch (error) {
    handleError(res, error, 'Ошибка экипировки предмета');
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body; // Новый параметр для указания количества удаляемых предметов
    const character = await getCurrentCharacter(req.user._id);

    const charItem = await CharItem.findById(itemId).populate('gameItem');
    if (!charItem) {
      throw new Error('Предмет не найден');
    }

    if (charItem.isEquipped) {
      throw new Error('Нельзя удалить экипированный предмет');
    }

    if (charItem.gameItem.isStackable && quantity && quantity < charItem.quantity) {
      // Уменьшаем количество предметов в стеке
      charItem.quantity -= quantity;
      await charItem.save();
    } else {
      // Удаляем предмет полностью
      character.inventory = character.inventory.filter(item => item.toString() !== itemId);
      await CharItem.findByIdAndDelete(itemId);
    }

    await character.save();

    res.json(await getFullCharacterData(character));
  } catch (error) {
    handleError(res, error, 'Ошибка удаления предмета');
  }
};

exports.addItemToInventory = async (req, res) => {
  try {
    const { gameItemId, quantity = 1 } = req.body;
    const character = await getCurrentCharacter(req.user._id);
    const gameItem = await GameItem.findById(gameItemId);

    if (!gameItem) throw new Error('Игровой предмет не найден');

    if (gameItem.isStackable) {
      let charItem = await CharItem.findOne({
        character: character._id,
        gameItem: gameItemId,
        isEquipped: false
      });

      if (charItem) {
        const newQuantity = charItem.quantity + quantity;
        if (newQuantity <= gameItem.maxQuantity) {
          charItem.quantity = newQuantity;
        } else {
          charItem.quantity = gameItem.maxQuantity;
          const remainingQuantity = newQuantity - gameItem.maxQuantity;
          if (remainingQuantity > 0) {
            await CharItem.create({
              character: character._id,
              gameItem: gameItemId,
              quantity: remainingQuantity
            });
          }
        }
        await charItem.save();
      } else {
        charItem = await CharItem.create({
          character: character._id,
          gameItem: gameItemId,
          quantity: Math.min(quantity, gameItem.maxQuantity)
        });
        character.inventory.push(charItem._id);
      }
    } else {
      const charItem = await CharItem.create({
        character: character._id,
        gameItem: gameItemId,
        quantity: 1
      });
      character.inventory.push(charItem._id);
    }

    await character.save();
    res.json(await getFullCharacterData(character));
  } catch (error) {
    handleError(res, error, 'Ошибка добавления предмета в инвентарь');
  }
};

exports.getHealthData = async (req, res) => {
  try {
    const character = await getCurrentCharacter(req.user._id);
    res.json(character.getHealthData());
  } catch (error) {
    handleError(res, error, 'Ошибка при получении данных о здоровье');
  }
};

exports.damageCharacter = async (req, res) => {
  try {
    const { damage } = req.body;
    console.log(`Получен запрос на нанесение урона: ${damage} (тип: ${typeof damage})`);

    if (typeof damage !== 'number' || isNaN(damage) || damage < 0) {
      console.log('Неверное значение урона');
      return res.status(400).json({ message: `Урон: ${damage} (тип: ${typeof damage})` });
    }

    const character = await getCurrentCharacter(req.user._id);
    if (!character) {
      console.log('Персонаж не найден');
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const currentHealth = character.getCurrentHealth();
    console.log(`Текущее здоровье: ${currentHealth} (тип: ${typeof currentHealth})`);

    const newHealth = Math.max(0, currentHealth - damage);
    console.log(`Новое здоровье после урона: ${newHealth} (тип: ${typeof newHealth})`);

    character.updateHealth(newHealth);
    console.log('Здоровье обновлено');

    console.log('Персонаж перед сохранением:', JSON.stringify(character.toObject(), null, 2));
    await character.save();
    console.log('Персонаж сохранен');

    const updatedHealthData = character.getHealthData();
    console.log('Обновленные данные о здоровье:', JSON.stringify(updatedHealthData, null, 2));

    res.json(updatedHealthData);
  } catch (error) {
    console.error('Ошибка при нанесении урона персонажу:', error);
    res.status(400).json({ message: 'Ошибка при нанесении урона персонажу', error: error.message });
  }
};

module.exports = exports;