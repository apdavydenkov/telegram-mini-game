const Character = require('../models/Character');
const User = require('../models/User');
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

    res.status(201).json(character);
  } catch (error) {
    console.error('Ошибка создания персонажа:', error);
    res.status(400).json({ message: 'Ошибка создания персонажа', error: error.message });
  }
};

exports.getCharacter = async (req, res) => {
  try {
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    character.updateHealth();
    await character.save({ validateBeforeSave: false });
    
    const characterData = character.toObject();
    characterData.calculatedStats = character.calculatedStats;
    
    res.json(characterData);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    res.status(400).json({ message: 'Ошибка при получении персонажа', error: error.message });
  }
};

exports.updateCharacter = async (req, res) => {
  try {
    const { baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma, version } = req.body;
    
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    if (character.version !== version) {
      return res.status(409).json({ message: 'Конфликт версий. Обновите данные и попробуйте снова.' });
    }

    if (character.finalDistribution) {
      return res.status(400).json({ message: 'Распределение очков уже завершено' });
    }

    const newTotalStats = baseStrength + baseDexterity + baseIntelligence + baseEndurance + baseCharisma;
    const oldTotalStats = character.baseStrength + character.baseDexterity + character.baseIntelligence + character.baseEndurance + character.baseCharisma;
    const pointsSpent = newTotalStats - oldTotalStats;

    if (pointsSpent > character.availablePoints || pointsSpent < 0) {
      return res.status(400).json({ message: 'Недопустимое распределение очков' });
    }

    // Проверяем каждую характеристику отдельно
    if (baseStrength < character.baseStrength || baseStrength > character.baseStrength + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение силы' });
    if (baseDexterity < character.baseDexterity || baseDexterity > character.baseDexterity + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение ловкости' });
    if (baseIntelligence < character.baseIntelligence || baseIntelligence > character.baseIntelligence + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение интеллекта' });
    if (baseEndurance < character.baseEndurance || baseEndurance > character.baseEndurance + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение выносливости' });
    if (baseCharisma < character.baseCharisma || baseCharisma > character.baseCharisma + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение харизмы' });

    character.baseStrength = baseStrength;
    character.baseDexterity = baseDexterity;
    character.baseIntelligence = baseIntelligence;
    character.baseEndurance = baseEndurance;
    character.baseCharisma = baseCharisma;
    character.availablePoints -= pointsSpent;

    // Устанавливаем finalDistribution в true, если все очки распределены
    if (character.availablePoints === 0) {
      character.finalDistribution = true;
    }

    await character.save();
    const updatedCharacter = character.toObject();
    updatedCharacter.calculatedStats = character.calculatedStats;
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Ошибка обновления персонажа:', error);
    res.status(400).json({ message: 'Ошибка обновления персонажа', error: error.message });
  }
};

exports.addCharItemToInventory = async (req, res) => {
  try {
    const { charItemId } = req.body;
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    const charItem = await CharItem.findById(charItemId);
    if (!charItem) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    const inventoryCharItem = character.inventory.find(i => i.charItem.toString() === charItemId);
    if (inventoryCharItem) {
      inventoryCharItem.quantity += 1;
    } else {
      character.inventory.push({ charItem: charItemId, quantity: 1 });
    }

    await character.save();
    res.json(character);
  } catch (error) {
    console.error('Ошибка добавления предмета в инвентарь:', error);
    res.status(400).json({ message: 'Ошибка добавления предмета в инвентарь', error: error.message });
  }
};

exports.equipCharItem = async (req, res) => {
  try {
    const { charItemId, slot } = req.body;
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const charItem = await CharItem.findById(charItemId);
    if (!charItem) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    if (charItem.slot !== slot) {
      return res.status(400).json({ message: 'Предмет нельзя экипировать в этот слот' });
    }

    // Снимаем текущий предмет, если он есть
    if (character.equipment[slot]) {
      character.inventory.push({ charItem: character.equipment[slot], quantity: 1 });
    }

    // Удаляем предмет из инвентаря и экипируем его
    const inventoryIndex = character.inventory.findIndex(i => i.charItem.toString() === charItemId);
    if (inventoryIndex === -1) {
      return res.status(400).json({ message: 'Предмет не найден в инвентаре' });
    }

    if (character.inventory[inventoryIndex].quantity > 1) {
      character.inventory[inventoryIndex].quantity -= 1;
    } else {
      character.inventory.splice(inventoryIndex, 1);
    }

    character.equipment[slot] = charItemId;

    await character.save();
    res.json(character);
  } catch (error) {
    console.error('Ошибка экипировки предмета:', error);
    res.status(400).json({ message: 'Ошибка экипировки предмета', error: error.message });
  }
};

module.exports = exports;