const express = require('express');
const router = express.Router();
const { createGameItem, getAllGameItems, getGameItemById, updateGameItem, deleteGameItem, sendGameItem } = require('../controllers/gameItemController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', authMiddleware, getAllGameItems);
router.get('/:id', authMiddleware, getGameItemById);
router.post('/', authMiddleware, adminMiddleware, createGameItem);
router.put('/:id', authMiddleware, adminMiddleware, updateGameItem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGameItem);
router.post('/send/:gameItemId/:characterId', authMiddleware, adminMiddleware, sendGameItem);

module.exports = router;