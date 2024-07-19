const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleError = (res, status, message) => {
  console.error(message);
  res.status(status).json({ message });
};

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const getUserData = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  hasCharacter: user.hasCharacter
});

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Проверяем, существует ли уже пользователь с таким именем или email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return handleError(res, 400, 'Пользователь уже существует');
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем нового пользователя
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      hasCharacter: false
    });
    
    // Генерируем токен
    const token = generateToken(newUser._id);
    
    res.status(201).json({ 
      message: 'Пользователь успешно зарегистрирован', 
      token,
      user: getUserData(newUser)
    });
  } catch (error) {
    handleError(res, 500, 'Ошибка сервера при регистрации');
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Ищем пользователя
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return handleError(res, 400, 'Неверные учетные данные');
    }
    
    // Генерируем токен
    const token = generateToken(user._id);
    
    res.json({ token, user: getUserData(user) });
  } catch (error) {
    handleError(res, 400, 'Ошибка входа');
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return handleError(res, 404, 'Пользователь не найден');
    }
    res.json(getUserData(user));
  } catch (error) {
    handleError(res, 500, 'Ошибка при получении данных пользователя');
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { role: 'admin' }, { new: true });
    if (!user) {
      return handleError(res, 404, 'Пользователь не найден');
    }
    res.json({
      message: 'Роль пользователя обновлена до админа',
      user: getUserData(user)
    });
  } catch (error) {
    handleError(res, 500, 'Ошибка обновления роли пользователя');
  }
};

module.exports = exports;