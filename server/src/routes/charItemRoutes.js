const express = require('express');
const router = express.Router();
const { createCharItem, getCharItemById, updateCharItem, deleteCharItem } = require('../controllers/charItemController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createCharItem);
router.get('/:id', authMiddleware, getCharItemById);
router.put('/:id', authMiddleware, updateCharItem);
router.delete('/:id', authMiddleware, deleteCharItem);

module.exports = router;