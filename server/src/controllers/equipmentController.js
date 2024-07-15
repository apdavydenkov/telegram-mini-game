// controllers/equipmentController.js
const Equipment = require('../models/Equipment');
const Character = require('../models/Character');

exports.createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating equipment', error: error.message });
  }
};

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching equipment', error: error.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching equipment', error: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating equipment', error: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting equipment', error: error.message });
  }
};

exports.sendEquipmentById = async (req, res) => {
  try {
    const { equipmentId, characterId } = req.params;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Добавляем оборудование к персонажу
    character.inventory.push(equipment._id);
    await character.save();
    
    res.json({ message: 'Equipment sent to character successfully', character });
  } catch (error) {
    res.status(400).json({ message: 'Error sending equipment', error: error.message });
  }
};