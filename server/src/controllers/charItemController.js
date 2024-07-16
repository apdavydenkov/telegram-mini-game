const CharItem = require('../models/CharItem');
const Character = require('../models/Character');
const GameItem = require('../models/GameItem');

exports.createCharItem = async (req, res) => {
  try {
    const { gameItemId, characterId, quantity } = req.body;
    
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Персонаж не найден' });
    }

    const gameItem = await GameItem.findById(gameItemId);
    if (!gameItem) {
      return res.status(404).json({ message: 'Игровой предмет не найден' });
    }

    const charItem = new CharItem({
      gameItem: gameItemId,
      character: characterId,
      quantity: quantity || 1
    });

    await charItem.save();
    character.inventory.push(charItem._id);
    await character.save();

    res.status(201).json(charItem);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка создания предмета персонажа', error: error.message });
  }
};

exports.getCharItemById = async (req, res) => {
  try {
    const charItem = await CharItem.findById(req.params.id).populate('gameItem');
    if (!charItem) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }
    res.json(charItem);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка получения предмета', error: error.message });
  }
};

exports.updateCharItem = async (req, res) => {
  try {
    const { quantity, isEquipped, slot } = req.body;
    const charItem = await CharItem.findById(req.params.id);
    
    if (!charItem) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    if (quantity !== undefined) charItem.quantity = quantity;
    if (isEquipped !== undefined) charItem.isEquipped = isEquipped;
    if (slot !== undefined) charItem.slot = slot;

    await charItem.save();
    res.json(charItem);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка обновления предмета', error: error.message });
  }
};

exports.deleteCharItem = async (req, res) => {
  try {
    const charItem = await CharItem.findById(req.params.id);
    if (!charItem) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    const character = await Character.findById(charItem.character);
    if (character) {
      character.inventory = character.inventory.filter(item => item.toString() !== charItem._id.toString());
      await character.save();
    }

    await CharItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Предмет успешно удален' });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка удаления предмета', error: error.message });
  }
};

module.exports = exports;