const CharItem = require('../models/CharItem');

exports.createCharItem = async (req, res) => {
  try {
    const charItem = new CharItem(req.body);
    await charItem.save();
    res.status(201).json(charItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating char item', error: error.message });
  }
};

exports.getAllCharItems = async (req, res) => {
  try {
    const charItems = await CharItem.find();
    res.json(charItems);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching char items', error: error.message });
  }
};