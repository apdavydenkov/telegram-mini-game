const Character = require('../models/Character');
const Item = require('../models/Item');

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

exports.addItemToInventory = async (req, res) => {
  try {
	const { itemId } = req.body;
	const character = await Character.findOne({ user: req.user._id });
	if (!character) {
	  return res.status(404).json({ message: 'Character not found' });
	}
	
	const item = await Item.findById(itemId);
	if (!item) {
	  return res.status(404).json({ message: 'Item not found' });
	}

	const inventoryItem = character.inventory.find(i => i.item.toString() === itemId);
	if (inventoryItem) {
	  inventoryItem.quantity += 1;
	} else {
	  character.inventory.push({ item: itemId, quantity: 1 });
	}

	await character.save();
	res.json(character);
  } catch (error) {
	res.status(400).json({ message: 'Error adding item to inventory', error: error.message });
  }
};

exports.equipItem = async (req, res) => {
  try {
	const { itemId, slot } = req.body;
	const character = await Character.findOne({ user: req.user._id });
	if (!character) {
	  return res.status(404).json({ message: 'Character not found' });
	}

	const item = await Item.findById(itemId);
	if (!item) {
	  return res.status(404).json({ message: 'Item not found' });
	}

	if (item.slot !== slot) {
	  return res.status(400).json({ message: 'Item cannot be equipped in this slot' });
	}

	// Unequip current item if exists
	if (character.equipment[slot]) {
	  character.inventory.push({ item: character.equipment[slot], quantity: 1 });
	}

	// Remove item from inventory and equip it
	const inventoryIndex = character.inventory.findIndex(i => i.item.toString() === itemId);
	if (inventoryIndex === -1) {
	  return res.status(400).json({ message: 'Item not in inventory' });
	}

	if (character.inventory[inventoryIndex].quantity > 1) {
	  character.inventory[inventoryIndex].quantity -= 1;
	} else {
	  character.inventory.splice(inventoryIndex, 1);
	}

	character.equipment[slot] = itemId;

	await character.save();
	res.json(character);
  } catch (error) {
	res.status(400).json({ message: 'Error equipping item', error: error.message });
  }
};