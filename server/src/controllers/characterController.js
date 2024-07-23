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
  if (!character) throw new Error('Персонаж не найден');
  return character;
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

exports.getCharacter = async (req, res) => {
  try {
    const character = await getCurrentCharacter(req.user._id);
    res.json(await getFullCharacterData(character));
  } catch (error) {
    handleError(res, error, 'Ошибка при получении персонажа');
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
    const { charItemId } = req.body;
    const character = await getCurrentCharacter(req.user._id);

    const charItemToEquip = character.inventory.find(charItem => charItem._id.toString() === charItemId);
    if (!charItemToEquip || !charItemToEquip.gameItem) throw new Error('Предмет не найден в инвентаре или не содержит данных gameItem');

    const gameItemType = charItemToEquip.gameItem.type;

    if (charItemToEquip.isEquipped) {
      charItemToEquip.isEquipped = false;
      charItemToEquip.slot = null;
    } else {
      if (gameItemType === 'useful') {
        const usefulSlots = ['useful1', 'useful2', 'useful3'];
        const emptySlot = usefulSlots.find(slot => !character.inventory.some(charItem => charItem.isEquipped && charItem.slot === slot));
        
        if (emptySlot) {
          charItemToEquip.slot = emptySlot;
        } else {
          const charItemInThirdSlot = character.inventory.find(charItem => charItem.isEquipped && charItem.slot === 'useful3');
          if (charItemInThirdSlot) {
            Object.assign(charItemInThirdSlot, { isEquipped: false, slot: null });
            await charItemInThirdSlot.save();
          }
          charItemToEquip.slot = 'useful3';
        }
      } else {
        const equippedCharItem = character.inventory.find(charItem => 
          charItem.isEquipped && charItem.gameItem && charItem.gameItem.type === gameItemType
        );
        if (equippedCharItem) {
          Object.assign(equippedCharItem, { isEquipped: false, slot: null });
          await equippedCharItem.save();
        }
        charItemToEquip.slot = gameItemType;
      }
      
      charItemToEquip.isEquipped = true;
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
    const character = await getCurrentCharacter(req.user._id);

    character.inventory = character.inventory.filter(item => item._id.toString() !== itemId);
    await character.save();

    await CharItem.findByIdAndDelete(itemId);

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

    let charItem = await CharItem.findOne({ character: character._id, gameItem: gameItemId, isEquipped: false });
    if (charItem) {
      charItem.quantity += quantity;
    } else {
      charItem = new CharItem({ character: character._id, gameItem: gameItemId, quantity });
    }

    await charItem.save();
    character.inventory.push(charItem._id);
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
    const character = await getCurrentCharacter(req.user._id);

    character.updateHealth(Math.max(0, character.getCurrentHealth() - damage));
    await character.save();

    res.json(character.getHealthData());
  } catch (error) {
    handleError(res, error, 'Ошибка при нанесении урона персонажу');
  }
};

module.exports = exports;