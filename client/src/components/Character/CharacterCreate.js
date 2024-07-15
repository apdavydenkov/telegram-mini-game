import React, { useState } from 'react';
import axios from 'axios';
import { APP_SERVER_URL } from '../../config/config';

const CharacterCreate = ({ onCharacterCreated }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('Warrior');
  const [strength, setStrength] = useState(10);
  const [dexterity, setDexterity] = useState(10);
  const [intelligence, setIntelligence] = useState(10);
  const [endurance, setEndurance] = useState(10);
  const [charisma, setCharisma] = useState(10);
  const [availablePoints, setAvailablePoints] = useState(5);

  const handleStatChange = (stat, value) => {
    if (availablePoints > 0 || value < 0) {
      switch (stat) {
        case 'strength':
          setStrength(prev => Math.max(10, prev + value));
          break;
        case 'dexterity':
          setDexterity(prev => Math.max(10, prev + value));
          break;
        case 'intelligence':
          setIntelligence(prev => Math.max(10, prev + value));
          break;
        case 'endurance':
          setEndurance(prev => Math.max(10, prev + value));
          break;
        case 'charisma':
          setCharisma(prev => Math.max(10, prev + value));
          break;
        default:
          break;
      }
      setAvailablePoints(prev => prev - value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${APP_SERVER_URL}/api/character`,
        { name, class: characterClass, strength, dexterity, intelligence, endurance, charisma },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCharacterCreated(response.data);
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Character</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Character Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <select
          value={characterClass}
          onChange={(e) => setCharacterClass(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="Warrior">Warrior</option>
          <option value="Mage">Mage</option>
          <option value="Archer">Archer</option>
        </select>
        <p className="mb-2">Available points: {availablePoints}</p>
        {['strength', 'dexterity', 'intelligence', 'endurance', 'charisma'].map((stat) => (
          <div key={stat} className="flex justify-between items-center mb-2">
            <span className="capitalize">{stat}: {eval(stat)}</span>
            <div>
              <button type="button" onClick={() => handleStatChange(stat, -1)} className="px-2 py-1 bg-red-500 text-white rounded mr-2" disabled={eval(stat) <= 10}>-</button>
              <button type="button" onClick={() => handleStatChange(stat, 1)} className="px-2 py-1 bg-green-500 text-white rounded" disabled={availablePoints <= 0}>+</button>
            </div>
          </div>
        ))}
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Create Character</button>
      </form>
    </div>
  );
};

export default CharacterCreate;