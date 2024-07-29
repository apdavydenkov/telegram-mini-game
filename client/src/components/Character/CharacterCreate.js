import React, { useState } from 'react';
import { characterAPI } from '../../services/api';

const CharacterCreate = ({ onCharacterCreated }) => {
  const [nickname, setNickname] = useState('');
  const [characterClass, setCharacterClass] = useState('Warrior');
  const [stats, setStats] = useState({
    baseStrength: 10,
    baseDexterity: 10,
    baseIntelligence: 10,
    baseEndurance: 10,
    baseCharisma: 10
  });
  const [availablePoints, setAvailablePoints] = useState(5);

  const handleStatChange = (stat, value) => {
    if (availablePoints > 0 || value < 0) {
      const currentValue = stats[stat];
      if (currentValue + value >= 10) {
        setStats(prevStats => ({
          ...prevStats,
          [stat]: currentValue + value
        }));
        setAvailablePoints(prev => prev - value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await characterAPI.create({ nickname, class: characterClass, ...stats });
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
          placeholder="Character Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
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
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center mb-2">
            <span className="capitalize">{stat.replace('base', '')}: {value}</span>
            <div>
              <button type="button" onClick={() => handleStatChange(stat, -1)} className="px-2 py-1 bg-red-500 text-white rounded mr-2" disabled={value <= 10}>-</button>
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