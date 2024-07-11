const express = require('express');
const router = express.Router();
const { register, login, getMe, makeAdmin } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/make-admin', authMiddleware, makeAdmin);
router.get('/me', authMiddleware, getMe);


module.exports = router;