const Character = require('../models/Character');
const User = require('../models/User');


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

    // Получаем данные о здоровье
    const healthData = character.getHealthData();

    // Добавляем healthData к ответу
    const characterData = character.toObject();
    characterData.healthData = healthData;

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
    const characterData = character.toObject();
    characterData.healthData = healthData;
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

    character.baseStrength = baseStrength;
    character.baseDexterity = baseDexterity;
    character.baseIntelligence = baseIntelligence;
    character.baseEndurance = baseEndurance;
    character.baseCharisma = baseCharisma;
    character.availablePoints -= pointsSpent;

    await character.save();
    
    const healthData = character.getHealthData();
    const characterData = character.toObject();
    characterData.healthData = healthData;
    characterData.calculatedStats = character.calculatedStats;

    res.json(characterData);
  } catch (error) {
    console.error('Ошибка обновления персонажа:', error);
    res.status(400).json({ message: 'Ошибка обновления персонажа', error: error.message });
  }
};

exports.equipCharItem = async (req, res) => {
  try {
    const { charItemId } = req.body;
    const character = await Character.findOne({ user: req.user._id }).populate('inventory');
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const charItem = character.inventory.find(item => item._id.toString() === charItemId);
    if (!charItem) {
      return res.status(404).json({ message: 'Предмет не найден в инвентаре' });
    }

    const itemSlot = charItem.gameItem.type;

    // Если предмет уже экипирован, снимаем его
    if (charItem.isEquipped) {
      charItem.isEquipped = false;
      charItem.slot = null;
    } else {
      // Снимаем текущий предмет в этом слоте, если он есть
      const currentEquipped = character.inventory.find(item => item.isEquipped && item.gameItem.type === itemSlot);
      if (currentEquipped) {
        currentEquipped.isEquipped = false;
        currentEquipped.slot = null;
        await currentEquipped.save();
      }

      // Экипируем новый предмет
      charItem.isEquipped = true;
      charItem.slot = itemSlot;
    }

    await charItem.save();
    await character.save();

    res.json(await character.populate('inventory.gameItem'));
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

    res.json(character);
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