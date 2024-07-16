const express = require('express');
const router = express.Router();
const { 
  createGameItem, 
  getAllGameItems, 
  getGameItemById, 
  updateGameItem, 
  deleteGameItem,
  sendGameItemToCharacter
} = require('../controllers/gameItemController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', authMiddleware, adminMiddleware, createGameItem);
router.get('/', authMiddleware, getAllGameItems);
router.get('/:id', authMiddleware, getGameItemById);
router.put('/:id', authMiddleware, adminMiddleware, updateGameItem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGameItem);
router.post('/send/:gameItemId/:characterId', authMiddleware, adminMiddleware, sendGameItemToCharacter);

module.exports = router;