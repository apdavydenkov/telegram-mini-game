const Character = require('../models/Character');

exports.createCharacter = async (req, res) => {
  try {
    const { name, class: characterClass, strength, dexterity, intelligence } = req.body;
    
    // Проверка распределения очков
    const baseStats = 30; // 10 на каждую характеристику
    const totalStats = strength + dexterity + intelligence;
    if (totalStats - baseStats > 5) {
      return res.status(400).json({ message: 'Invalid stat distribution' });
    }

    const character = new Character({
      user: req.user._id,
      name,
      class: characterClass,
      strength,
      dexterity,
      intelligence,
      availablePoints: 5 - (totalStats - baseStats)
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
    const { strength, dexterity, intelligence, availablePoints } = req.body;
    
    // Проверка валидности обновления
    const character = await Character.findOne({ user: req.user._id });
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const totalPointsUsed = (strength - character.strength) +
                            (dexterity - character.dexterity) +
                            (intelligence - character.intelligence);

    if (totalPointsUsed > character.availablePoints) {
      return res.status(400).json({ message: 'Invalid stat distribution' });
    }

    character.strength = strength;
    character.dexterity = dexterity;
    character.intelligence = intelligence;
    character.availablePoints = availablePoints;

    await character.save();
    res.json(character);
  } catch (error) {
    res.status(400).json({ message: 'Error updating character', error: error.message });
  }
};