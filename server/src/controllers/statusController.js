const Character = require('../models/Character');

exports.updateStatus = async (req, res) => {
  try {
    const { statusType, newStatus } = req.body;
    const character = await Character.findOne({ user: req.user._id });
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    character.status[statusType] = newStatus;
    await character.save();

    res.json({ status: character.status });
  } catch (error) {
    res.status(400).json({ message: 'Error updating status', error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const character = await Character.findOne({ user: req.user._id });
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({ status: character.status });
  } catch (error) {
    res.status(400).json({ message: 'Error getting status', error: error.message });
  }
};