const express = require('express');
const { 
  createCharacter, 
  getCharacter, 
  updateCharacter, 
  addItemToInventory, 
  equipItem 
} = require('../controllers/characterController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createCharacter);
router.get('/', authMiddleware, getCharacter);
router.put('/', authMiddleware, updateCharacter);
router.post('/inventory', authMiddleware, addItemToInventory);
router.post('/equip', authMiddleware, equipItem);

module.exports = router;