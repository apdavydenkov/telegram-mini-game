const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, makeAdmin } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/make-admin', authMiddleware, makeAdmin);
router.get('/current-user', authMiddleware, getCurrentUser);


module.exports = router;