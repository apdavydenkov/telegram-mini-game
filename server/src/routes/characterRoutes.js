const express = require('express');
const { 
  createCharacter, 
  getCharacter, 
  updateCharacter, 
  addCharItemToInventory, 
  equipCharItem 
} = require('../controllers/characterController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createCharacter);
router.get('/', authMiddleware, getCharacter);
router.put('/', authMiddleware, updateCharacter);
router.post('/inventory', authMiddleware, addCharItemToInventory);
router.post('/equip', authMiddleware, equipCharItem);

module.exports = router;