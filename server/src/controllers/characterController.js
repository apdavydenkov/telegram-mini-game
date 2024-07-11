const Character = require('../models/Character');
const User = require('../models/User');
const Item = require('../models/Item');

exports.createCharacter = async (req, res) => {
  try {
    const { name, class: characterClass, strength, dexterity, intelligence, endurance, charisma } = req.body;
    
    // Проверка распределения очков
    const baseStats = 50; // 10 на каждую характеристику
    const totalStats = strength + dexterity + intelligence + endurance + charisma;
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
      name,
      class: characterClass,
      strength,
      dexterity,
      intelligence,
      endurance,
      charisma,
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
    res.json(character);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    res.status(400).json({ message: 'Ошибка при получении персонажа', error: error.message });
  }
};

exports.updateCharacter = async (req, res) => {
  try {
    const { strength, dexterity, intelligence, endurance, charisma, version } = req.body;
    
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

    const newTotalStats = strength + dexterity + intelligence + endurance + charisma;
    const oldTotalStats = character.strength + character.dexterity + character.intelligence + character.endurance + character.charisma;
    const pointsSpent = newTotalStats - oldTotalStats;

    if (pointsSpent > character.availablePoints || pointsSpent < 0) {
      return res.status(400).json({ message: 'Недопустимое распределение очков' });
    }

    // Проверяем каждую характеристику отдельно
    if (strength < character.strength || strength > character.strength + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение силы' });
    if (dexterity < character.dexterity || dexterity > character.dexterity + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение ловкости' });
    if (intelligence < character.intelligence || intelligence > character.intelligence + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение интеллекта' });
    if (endurance < character.endurance || endurance > character.endurance + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение выносливости' });
    if (charisma < character.charisma || charisma > character.charisma + character.availablePoints) return res.status(400).json({ message: 'Недопустимое значение харизмы' });

    character.strength = strength;
    character.dexterity = dexterity;
    character.intelligence = intelligence;
    character.endurance = endurance;
    character.charisma = charisma;
    character.availablePoints -= pointsSpent;

    if (character.availablePoints === 0) {
      character.finalDistribution = true;
    }

    await character.save();
    res.json(character);
  } catch (error) {
    console.error('Ошибка обновления персонажа:', error);
    res.status(400).json({ message: 'Ошибка обновления персонажа', error: error.message });
  }
};

exports.addItemToInventory = async (req, res) => {
  try {
    const { itemId } = req.body;
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }
    
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    const inventoryItem = character.inventory.find(i => i.item.toString() === itemId);
    if (inventoryItem) {
      inventoryItem.quantity += 1;
    } else {
      character.inventory.push({ item: itemId, quantity: 1 });
    }

    await character.save();
    res.json(character);
  } catch (error) {
    console.error('Ошибка добавления предмета в инвентарь:', error);
    res.status(400).json({ message: 'Ошибка добавления предмета в инвентарь', error: error.message });
  }
};

exports.equipItem = async (req, res) => {
  try {
    const { itemId, slot } = req.body;
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    if (item.slot !== slot) {
      return res.status(400).json({ message: 'Предмет нельзя экипировать в этот слот' });
    }

    // Снимаем текущий предмет, если он есть
    if (character.equipment[slot]) {
      character.inventory.push({ item: character.equipment[slot], quantity: 1 });
    }

    // Удаляем предмет из инвентаря и экипируем его
    const inventoryIndex = character.inventory.findIndex(i => i.item.toString() === itemId);
    if (inventoryIndex === -1) {
      return res.status(400).json({ message: 'Предмет не найден в инвентаре' });
    }

    if (character.inventory[inventoryIndex].quantity > 1) {
      character.inventory[inventoryIndex].quantity -= 1;
    } else {
      character.inventory.splice(inventoryIndex, 1);
    }

    character.equipment[slot] = itemId;

    await character.save();
    res.json(character);
  } catch (error) {
    console.error('Ошибка экипировки предмета:', error);
    res.status(400).json({ message: 'Ошибка экипировки предмета', error: error.message });
  }
};