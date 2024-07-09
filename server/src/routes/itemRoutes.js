const express = require('express');
const { createItem, getAllItems } = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createItem);
router.get('/', authMiddleware, getAllItems);

module.exports = router;