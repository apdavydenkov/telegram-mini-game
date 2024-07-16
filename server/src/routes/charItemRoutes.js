const express = require('express');
const { 
  createCharItem, 
  getCharItemById, 
  updateCharItem, 
  deleteCharItem 
} = require('../controllers/charItemController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createCharItem);
router.get('/:id', authMiddleware, getCharItemById);
router.put('/:id', authMiddleware, updateCharItem);
router.delete('/:id', authMiddleware, deleteCharItem);

module.exports = router;