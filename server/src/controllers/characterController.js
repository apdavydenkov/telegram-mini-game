const Character = require('../models/Character');
const User = require('../models/User');
const GameItem = require('../models/GameItem');
const CharItem = require('../models/CharItem');

exports.createCharacter = async (req, res) => {
  try {
    const { nickname, class: characterClass, baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma } = req.body;
    
    // Проверка распределения очков
    const baseStats = 50; // 10 на каждую характеристику
    const totalStats = baseStrength + baseDexterity + baseIntelligence + baseEndurance + baseCharisma;
    if (totalStats - baseStats > 5) {
      return res.status(400).json({ message: 'Неверное распределение характеристик' });
    }

    // Проверяем, есть ли уже персонаж у пользователя
    const existingCharacter = await Character.findOne({ user: req.user._id });
    if (existingCharacter) {
      return res.status(400).json({ message: 'У пользователя уже есть персонаж' });
    }

    const character = new Character({
      user: req.user._id,
      nickname,
      class: characterClass,
      baseStrength,
      baseDexterity,
      baseIntelligence,
      baseEndurance,
      baseCharisma,
      availablePoints: 5 - (totalStats - baseStats)
    });

    await character.save();

    // Обновляем поле hasCharacter у пользователя
    await User.findByIdAndUpdate(req.user._id, { hasCharacter: true });

    // Получаем данные о здоровье и рассчитываем характеристики
    const healthData = character.getHealthData();
    const calculatedStats = character.recalculateStats();

    // Добавляем healthData и calculatedStats к ответу
    const characterData = character.toObject();
    characterData.healthData = healthData;
    characterData.calculatedStats = calculatedStats;

    res.status(201).json(characterData);
  } catch (error) {
    console.error('Ошибка создания персонажа:', error);
    res.status(400).json({ message: 'Ошибка создания персонажа', error: error.message });
  }
};

exports.getCharacter = async (req, res) => {
  try {
    const character = await Character.findOne({ user: req.user._id })
      .populate({
        path: 'inventory',
        populate: { path: 'gameItem' }
      });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    const healthData = character.getHealthData();
    const calculatedStats = character.recalculateStats();
    const characterData = character.toObject();
    characterData.healthData = healthData;
    characterData.calculatedStats = calculatedStats;
    
    res.json(characterData);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    res.status(400).json({ message: 'Ошибка при получении персонажа', error: error.message });
  }
};

exports.updateCharacter = async (req, res) => {
  try {
    const { baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma, version } = req.body;
    
    const character = await Character.findOne({ user: req.user._id })
      .populate({
        path: 'inventory',
        populate: { path: 'gameItem' }
      });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    if (character.version !== version) {
      return res.status(409).json({ message: 'Конфликт версий. Обновите данные и попробуйте снова.' });
    }

    if (character.zeroPoints) {
      return res.status(400).json({ message: 'Распределение очков уже завершено' });
    }

    const newTotalStats = baseStrength + baseDexterity + baseIntelligence + baseEndurance + baseCharisma;
    const oldTotalStats = character.baseStrength + character.baseDexterity + character.baseIntelligence + character.baseEndurance + character.baseCharisma;
    const pointsSpent = newTotalStats - oldTotalStats;

    if (pointsSpent > character.availablePoints || pointsSpent < 0) {
      return res.status(400).json({ message: 'Недопустимое распределение очков' });
    }

    character.baseStrength = baseStrength;
    character.baseDexterity = baseDexterity;
    character.baseIntelligence = baseIntelligence;
    character.baseEndurance = baseEndurance;
    character.baseCharisma = baseCharisma;
    character.availablePoints -= pointsSpent;

    // Здоровье обновится автоматически в pre-save хуке
    await character.save();
    
    const healthData = character.getHealthData();
    const calculatedStats = character.recalculateStats();
    const characterData = character.toObject();
    characterData.healthData = healthData;
    characterData.calculatedStats = calculatedStats;

    res.json(characterData);
  } catch (error) {
    console.error('Ошибка обновления персонажа:', error);
    res.status(400).json({ message: 'Ошибка обновления персонажа', error: error.message });
  }
};

exports.equipCharItem = async (req, res) => {
  try {
    const { charItemId } = req.body;
    const character = await Character.findOne({ user: req.user._id }).populate({
      path: 'inventory',
      populate: { path: 'gameItem' }
    });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const charItemToEquip = character.inventory.find(charItem => charItem._id.toString() === charItemId);
    if (!charItemToEquip || !charItemToEquip.gameItem) {
      return res.status(404).json({ message: 'Предмет не найден в инвентаре или не содержит данных gameItem' });
    }

    const gameItemType = charItemToEquip.gameItem.type;

    // Если предмет уже экипирован, снимаем его
    if (charItemToEquip.isEquipped) {
      charItemToEquip.isEquipped = false;
      charItemToEquip.slot = null;
    } else {
      // Логика для расходуемых предметов
      if (gameItemType === 'useful') {
        const usefulSlots = ['useful1', 'useful2', 'useful3'];
        const emptySlot = usefulSlots.find(slot => 
          !character.inventory.some(charItem => charItem.isEquipped && charItem.slot === slot)
        );
        
        if (emptySlot) {
          charItemToEquip.slot = emptySlot;
        } else {
          // Если все слоты заняты, заменяем предмет в третьем слоте
          const charItemInThirdSlot = character.inventory.find(charItem => charItem.isEquipped && charItem.slot === 'useful3');
          if (charItemInThirdSlot) {
            charItemInThirdSlot.isEquipped = false;
            charItemInThirdSlot.slot = null;
            await charItemInThirdSlot.save();
          }
          charItemToEquip.slot = 'useful3';
        }
      } else {
        // Для остальных типов предметов логика остается прежней
        const equippedCharItem = character.inventory.find(charItem => 
          charItem.isEquipped && charItem.gameItem && charItem.gameItem.type === gameItemType
        );
        if (equippedCharItem) {
          equippedCharItem.isEquipped = false;
          equippedCharItem.slot = null;
          await equippedCharItem.save();
        }
        charItemToEquip.slot = gameItemType;
      }
      
      charItemToEquip.isEquipped = true;
    }

    await charItemToEquip.save();
    await character.save();

    const updatedCharacter = await Character.findOne({ user: req.user._id }).populate({
      path: 'inventory',
      populate: { path: 'gameItem' }
    });
    const healthData = updatedCharacter.getHealthData();
    const calculatedStats = updatedCharacter.recalculateStats();
    const characterData = updatedCharacter.toObject();
    characterData.healthData = healthData;
    characterData.calculatedStats = calculatedStats;

    res.json(characterData);
  } catch (error) {
    console.error('Ошибка экипировки предмета:', error);
    res.status(400).json({ message: 'Ошибка экипировки предмета', error: error.message });
  }
};

exports.addItemToInventory = async (req, res) => {
  try {
    const { gameItemId, quantity = 1 } = req.body;
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const gameItem = await GameItem.findById(gameItemId);
    if (!gameItem) {
      return res.status(404).json({ message: 'Игровой предмет не найден' });
    }

    let charItem = await CharItem.findOne({ character: character._id, gameItem: gameItemId, isEquipped: false });
    if (charItem) {
      charItem.quantity += quantity;
    } else {
      charItem = new CharItem({
        character: character._id,
        gameItem: gameItemId,
        quantity
      });
    }

    await charItem.save();
    character.inventory.push(charItem._id);
    await character.save();

    const updatedCharacter = await Character.findOne({ user: req.user._id }).populate({
      path: 'inventory',
      populate: { path: 'gameItem' }
    });
    const healthData = updatedCharacter.getHealthData();
    const calculatedStats = updatedCharacter.recalculateStats();
    const characterData = updatedCharacter.toObject();
    characterData.healthData = healthData;
    characterData.calculatedStats = calculatedStats;

    res.json(characterData);
  } catch (error) {
    console.error('Ошибка добавления предмета в инвентарь:', error);
    res.status(400).json({ message: 'Ошибка добавления предмета в инвентарь', error: error.message });
  }
};

exports.getHealthData = async (req, res) => {
  try {
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const healthData = character.getHealthData();
    res.json(healthData);
  } catch (error) {
    console.error('Ошибка при получении данных о здоровье:', error);
    res.status(400).json({ message: 'Ошибка при получении данных о здоровье', error: error.message });
  }
};

exports.damageCharacter = async (req, res) => {
  try {
    const { damage } = req.body;
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const currentHealth = character.getCurrentHealth();
    const newHealth = Math.max(0, currentHealth - damage);
    character.updateHealth(newHealth);

    await character.save();

    const healthData = character.getHealthData();
    res.json(healthData);
  } catch (error) {
    console.error('Ошибка при нанесении урона персонажу:', error);
    res.status(400).json({ message: 'Ошибка при нанесении урона персонажу', error: error.message });
  }
};

module.exports = exports;