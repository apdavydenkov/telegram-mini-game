const express = require('express');
const router = express.Router();
const { updateStatus, getStatus } = require('../controllers/statusController');
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/', authMiddleware, updateStatus);
router.get('/', authMiddleware, getStatus);

module.exports = router;