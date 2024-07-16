const express = require('express');
const { 
  createCharacter, 
  getCharacter, 
  updateCharacter, 
  equipCharItem,
  addItemToInventory,
  getHealthData,
  damageCharacter
} = require('../controllers/characterController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createCharacter);
router.get('/', authMiddleware, getCharacter);
router.put('/', authMiddleware, updateCharacter);
router.post('/equip', authMiddleware, equipCharItem);
router.post('/addItem', authMiddleware, addItemToInventory);
router.get('/health', authMiddleware, getHealthData);
router.post('/damage', authMiddleware, damageCharacter);

module.exports = router;