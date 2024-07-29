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

const processStackableItem = async (gameItem, character, quantity) => {
  let charItem = await CharItem.findOne({
    character: character._id,
    gameItem: gameItem._id,
  });

  if (charItem) {
    charItem.quantity += quantity;
    await charItem.save();
  } else {
    charItem = await CharItem.create({
      gameItem: gameItem._id,
      character: character._id,
      quantity,
      equippedQuantity: 0,
      isEquipped: false,
      slot: null
    });
    character.inventory.push(charItem._id);
  }
};

const processNonStackableItem = async (gameItem, character, quantity) => {
  const newCharItems = await Promise.all(
    Array(quantity).fill().map(() => 
      CharItem.create({
        gameItem: gameItem._id,
        character: character._id,
        quantity: 1,
        equippedQuantity: 0,
        isEquipped: false,
        slot: null
      })
    )
  );
  character.inventory.push(...newCharItems.map(item => item._id));
};

exports.createGameItem = async (req, res) => {
  try {
    const { isStackable, maxQuantity, ...otherFields } = req.body;
    const gameItem = await GameItem.create({
      ...otherFields,
      isStackable: isStackable || false,
      maxQuantity: isStackable ? (maxQuantity || 1) : 1
    });
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
    const { isStackable, maxQuantity, ...otherFields } = req.body;
    const gameItem = await GameItem.findByIdAndUpdate(req.params.id, {
      ...otherFields,
      isStackable: isStackable || false,
      maxQuantity: isStackable ? (maxQuantity || 1) : 1
    }, { new: true });
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
    const { gameItemId, characterId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      throw new Error('Неверное количество предметов');
    }

    const [gameItem, character] = await Promise.all([
      getGameItem(gameItemId),
      Character.findById(characterId)
    ]);
    
    if (!character) throw new Error('Персонаж не найден');

    if (gameItem.isStackable) {
      await processStackableItem(gameItem, character, quantity);
    } else {
      await processNonStackableItem(gameItem, character, quantity);
    }

    await character.save();

    const updatedInventory = await CharItem.find({ character: characterId }).populate('gameItem');
    
    res.json({ 
      message: 'Игровой предмет успешно отправлен персонажу', 
      character: {
        ...character.toObject(),
        inventory: updatedInventory.map(item => ({
          ...item.toObject(),
          displayQuantity: item.quantity,
          equippedQuantity: item.equippedQuantity,
          availableQuantity: item.quantity - item.equippedQuantity,
          stacksCount: Math.ceil(item.quantity / (item.gameItem.isStackable ? item.gameItem.maxQuantity : 1))
        }))
      }
    });
  } catch (error) {
    handleError(res, error, 'Ошибка отправки игрового предмета');
  }
};

module.exports = exports;