const GameItem = require('../models/GameItem');
const Character = require('../models/Character');
const CharItem = require('../models/CharItem');

const handleError = (res, error, message) => {
  console.error(`${message}:`, error);
  res.status(400).json({ message, error: error.message });
};

const getGameItem = async (id) => {
  const gameItem = await GameItem.findById(id);
  if (!gameItem) throw new Error('Игровой предмет не найден');
  return gameItem;
};

exports.createGameItem = async (req, res) => {
  try {
    const gameItem = await GameItem.create(req.body);
    res.status(201).json(gameItem);
  } catch (error) {
    handleError(res, error, 'Ошибка создания игрового предмета');
  }
};

exports.getAllGameItems = async (req, res) => {
  try {
    const gameItems = await GameItem.find();
    res.json(gameItems);
  } catch (error) {
    handleError(res, error, 'Ошибка получения игровых предметов');
  }
};

exports.getGameItemById = async (req, res) => {
  try {
    const gameItem = await getGameItem(req.params.id);
    res.json(gameItem);
  } catch (error) {
    handleError(res, error, 'Ошибка получения игрового предмета');
  }
};

exports.updateGameItem = async (req, res) => {
  try {
    const gameItem = await GameItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gameItem) throw new Error('Игровой предмет не найден');
    res.json(gameItem);
  } catch (error) {
    handleError(res, error, 'Ошибка обновления игрового предмета');
  }
};

exports.deleteGameItem = async (req, res) => {
  try {
    const gameItem = await GameItem.findByIdAndDelete(req.params.id);
    if (!gameItem) throw new Error('Игровой предмет не найден');
    res.json({ message: 'Игровой предмет успешно удален' });
  } catch (error) {
    handleError(res, error, 'Ошибка удаления игрового предмета');
  }
};

exports.sendGameItem = async (req, res) => {
  try {
    const { gameItemId, characterId } = req.params;
    const [gameItem, character] = await Promise.all([
      getGameItem(gameItemId),
      Character.findById(characterId)
    ]);
    
    if (!character) throw new Error('Персонаж не найден');
    
    const charItem = await CharItem.create({
      gameItem: gameItem._id,
      character: character._id,
      quantity: 1,
      isEquipped: false,
      slot: null
    });
    
    character.inventory.push(charItem._id);
    await character.save();
    
    res.json({ message: 'Игровой предмет успешно отправлен персонажу', character });
  } catch (error) {
    handleError(res, error, 'Ошибка отправки игрового предмета');
  }
};

module.exports = exports;