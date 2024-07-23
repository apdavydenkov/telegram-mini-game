const express = require('express');
const router = express.Router();
const { createCharacter, getCharacter, updateCharacter, equipCharItem, removeItem, addItemToInventory, getHealthData, damageCharacter } = require('../controllers/characterController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createCharacter);
router.get('/', authMiddleware, getCharacter);
router.put('/', authMiddleware, updateCharacter);
router.post('/equip', authMiddleware, equipCharItem);
router.post('/addItem', authMiddleware, addItemToInventory);
router.get('/health', authMiddleware, getHealthData);
router.post('/damage', authMiddleware, damageCharacter);
router.delete('/removeItem/:itemId', authMiddleware, removeItem);

module.exports = router;