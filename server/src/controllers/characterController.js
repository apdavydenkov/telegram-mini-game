const Character = require('../models/Character');

exports.createCharacter = async (req, res) => {
  try {
    const { name, class: characterClass } = req.body;
    const character = new Character({
      user: req.user._id,
      name,
      class: characterClass
    });
    await character.save();
    res.status(201).json(character);
  } catch (error) {
    res.status(400).json({ message: 'Error creating character', error: error.message });
  }
};

exports.getCharacter = async (req, res) => {
  try {
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching character', error: error.message });
  }
};

exports.updateCharacter = async (req, res) => {
  try {
    const character = await Character.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
  } catch (error) {
    res.status(400).json({ message: 'Error updating character', error: error.message });
  }
}; 
