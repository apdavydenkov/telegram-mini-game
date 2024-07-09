const express = require('express');
const { createCharacter, getCharacter, updateCharacter } = require('../controllers/characterController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createCharacter);
router.get('/', authMiddleware, getCharacter);
router.put('/', authMiddleware, updateCharacter);

module.exports = router;