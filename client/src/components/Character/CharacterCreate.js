import React, { useState } from 'react';
import axios from 'axios';
import { APP_SERVER_URL } from '../../config/config';

const CharacterCreate = ({ onCharacterCreated }) => {
  const [nickname, setNickname] = useState('');
  const [characterClass, setCharacterClass] = useState('Warrior');
  const [baseStrength, setBaseStrength] = useState(10);
  const [baseDexterity, setBaseDexterity] = useState(10);
  const [baseIntelligence, setBaseIntelligence] = useState(10);
  const [baseEndurance, setBaseEndurance] = useState(10);
  const [baseCharisma, setBaseCharisma] = useState(10);
  const [availablePoints, setAvailablePoints] = useState(5);

  const handleStatChange = (stat, value) => {
    if (availablePoints > 0 || value < 0) {
      const statSetters = {
        baseStrength: setBaseStrength,
        baseDexterity: setBaseDexterity,
        baseIntelligence: setBaseIntelligence,
        baseEndurance: setBaseEndurance,
        baseCharisma: setBaseCharisma
      };

      const currentValue = {
        baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma
      }[stat];

      if (statSetters[stat]) {
        statSetters[stat](Math.max(10, currentValue + value));
        setAvailablePoints(prev => prev - value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${APP_SERVER_URL}/api/character`,
        { nickname, class: characterClass, baseStrength, baseDexterity, baseIntelligence, baseEndurance, baseCharisma },
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
        {['baseStrength', 'baseDexterity', 'baseIntelligence', 'baseEndurance', 'baseCharisma'].map((stat) => (
          <div key={stat} className="flex justify-between items-center mb-2">
            <span className="capitalize">{stat.replace('base', '')}: {eval(stat)}</span>
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