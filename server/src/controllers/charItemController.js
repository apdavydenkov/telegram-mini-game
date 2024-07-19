const CharItem = require('../models/CharItem');
const Character = require('../models/Character');
const GameItem = require('../models/GameItem');

const handleError = (res, status, message) => {
  console.error(message);
  res.status(status).json({ message });
};

exports.createCharItem = async (req, res) => {
  try {
    const { gameItemId, characterId, quantity } = req.body;
    
    const [character, gameItem] = await Promise.all([
      Character.findById(characterId),
      GameItem.findById(gameItemId)
    ]);

    if (!character) {
      return handleError(res, 404, 'Персонаж не найден');
    }
    if (!gameItem) {
      return handleError(res, 404, 'Игровой предмет не найден');
    }

    const charItem = await CharItem.create({
      gameItem: gameItemId,
      character: characterId,
      quantity: quantity || 1
    });

    character.inventory.push(charItem._id);
    await character.save();

    res.status(201).json(charItem);
  } catch (error) {
    handleError(res, 400, 'Ошибка создания предмета персонажа');
  }
};

exports.getCharItemById = async (req, res) => {
  try {
    const charItem = await CharItem.findById(req.params.id).populate('gameItem');
    if (!charItem) {
      return handleError(res, 404, 'Предмет не найден');
    }
    res.json(charItem);
  } catch (error) {
    handleError(res, 400, 'Ошибка получения предмета');
  }
};

exports.updateCharItem = async (req, res) => {
  try {
    const { quantity, isEquipped, slot } = req.body;
    const charItem = await CharItem.findByIdAndUpdate(
      req.params.id,
      { quantity, isEquipped, slot },
      { new: true, runValidators: true }
    );
    
    if (!charItem) {
      return handleError(res, 404, 'Предмет не найден');
    }

    res.json(charItem);
  } catch (error) {
    handleError(res, 400, 'Ошибка обновления предмета');
  }
};

exports.deleteCharItem = async (req, res) => {
  try {
    const charItem = await CharItem.findById(req.params.id);
    if (!charItem) {
      return handleError(res, 404, 'Предмет не найден');
    }

    const character = await Character.findById(charItem.character);
    if (character) {
      // Удаляем предмет из инвентаря персонажа
      character.inventory = character.inventory.filter(item => item.toString() !== charItem._id.toString());
      await character.save();
    }

    // Удаляем сам предмет
    await CharItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Предмет успешно удален' });
  } catch (error) {
    handleError(res, 400, 'Ошибка удаления предмета');
  }
};

module.exports = exports;