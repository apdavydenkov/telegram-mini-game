const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Проверяем, существует ли уже пользователь с таким именем или email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('Регистрация не удалась: Пользователь уже существует');
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    
    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Создаем нового пользователя
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      hasCharacter: false
    });
    
    await newUser.save();
    console.log('Создан новый пользователь:', newUser._id);
    
    // Генерируем токен
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Токен сгенерирован для нового пользователя');
    
    res.status(201).json({ 
      message: 'Пользователь успешно зарегистрирован', 
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        hasCharacter: newUser.hasCharacter
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Ищем пользователя
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Вход не удался: Пользователь не найден');
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }
    
    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Вход не удался: Неверный пароль');
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }
    
    // Генерируем токен
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Вход успешен, токен сгенерирован');
    
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        hasCharacter: user.hasCharacter
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      hasCharacter: user.hasCharacter
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};