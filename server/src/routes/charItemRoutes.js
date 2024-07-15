const express = require('express');
const { createCharItem, getAllCharItems } = require('../controllers/charItemController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createCharItem);
router.get('/', authMiddleware, getAllCharItems);

module.exports = router;