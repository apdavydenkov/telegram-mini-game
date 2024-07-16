const GameItem = require('../models/gameItem');
const Character = require('../models/Character');

exports.createGameItem = async (req, res) => {
  try {
    const gameItem = new GameItem(req.body);
    await gameItem.save();
    res.status(201).json(gameItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating game item', error: error.message });
  }
};

exports.getAllGameItems = async (req, res) => {
  try {
    const gameItems = await GameItem.find();
    res.json(gameItems);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching game items', error: error.message });
  }
};

exports.getGameItemById = async (req, res) => {
  try {
    const gameItem = await GameItem.findById(req.params.id);
    if (!gameItem) {
      return res.status(404).json({ message: 'Game item not found' });
    }
    res.json(gameItem);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching game item', error: error.message });
  }
};

exports.updateGameItem = async (req, res) => {
  try {
    const gameItem = await GameItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gameItem) {
      return res.status(404).json({ message: 'Game item not found' });
    }
    res.json(gameItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating game item', error: error.message });
  }
};

exports.deleteGameItem = async (req, res) => {
  try {
    const gameItem = await GameItem.findByIdAndDelete(req.params.id);
    if (!gameItem) {
      return res.status(404).json({ message: 'Game item not found' });
    }
    res.json({ message: 'Game item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting game item', error: error.message });
  }
};

exports.sendGameItemToCharacter = async (req, res) => {
  try {
    const { gameItemId, characterId } = req.params;

    const gameItem = await GameItem.findById(gameItemId);
    if (!gameItem) {
      return res.status(404).json({ message: 'Game item not found' });
    }
    
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Добавляем игровой предмет к персонажу
    character.inventory.push({ charItem: gameItem._id, quantity: 1 });
    await character.save();
    
    res.json({ message: 'Game item sent to character successfully', character });
  } catch (error) {
    res.status(400).json({ message: 'Error sending game item', error: error.message });
  }
};