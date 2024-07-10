import React, { useState } from 'react';
import axios from 'axios';
import { FaDumbbell, FaRunning, FaBrain, FaHeart, FaSmile, FaFistRaised, FaShieldAlt, FaBullseye, FaWind, FaHeartbeat } from 'react-icons/fa';

const CharacterInfo = ({ character, onCharacterUpdate, showDetailedStats }) => {
  const [updatedCharacter, setUpdatedCharacter] = useState(character);
  const [error, setError] = useState(null);

  const calculateDamage = () => updatedCharacter.strength * 10;
  const calculateArmor = () => updatedCharacter.strength * 5;
  const calculateCrit = () => (updatedCharacter.strength * 3) + (updatedCharacter.dexterity * 3);
  const calculateDodge = () => (updatedCharacter.dexterity * 3) + (updatedCharacter.intelligence * 3);
  const calculateHealthRegen = () => 1 + (updatedCharacter.intelligence * 0.05);

  const handleStatChange = async (stat, value) => {
    if ((value > 0 && updatedCharacter.availablePoints > 0) || (value < 0 && updatedCharacter[stat] > 10)) {
      const newCharacter = {
        ...updatedCharacter,
        [stat]: updatedCharacter[stat] + value,
        availablePoints: updatedCharacter.availablePoints - value
      };
      setUpdatedCharacter(newCharacter);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:5000/api/character', newCharacter, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onCharacterUpdate(response.data);
        setError(null);
      } catch (error) {
        console.error('Ошибка обновления характеристик:', error);
        setError('Не удалось обновить характеристики. Попробуйте еще раз.');
        setUpdatedCharacter(character);  // Возвращаем предыдущее состояние
      }
    }
  };

  const StatItem = ({ icon: Icon, label, value, stat }) => (
    <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm mb-2">
      <span className="flex items-center text-gray-700">
        <Icon className="mr-2 text-blue-500" />
        {label}:
      </span>
      <div className="flex items-center">
        <button 
          onClick={() => handleStatChange(stat, -1)} 
          disabled={value <= 10 || !stat}
          className="px-2 py-1 bg-red-500 text-white rounded mr-2 disabled:bg-gray-300"
        >
          -
        </button>
        <span className="font-semibold text-blue-600 mx-2">{value}</span>
        <button 
          onClick={() => handleStatChange(stat, 1)} 
          disabled={updatedCharacter.availablePoints <= 0 || !stat}
          className="px-2 py-1 bg-green-500 text-white rounded ml-2 disabled:bg-gray-300"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Базовые параметры</h3>
        <StatItem icon={FaDumbbell} label="Сила" value={updatedCharacter.strength} stat="strength" />
        <StatItem icon={FaRunning} label="Ловкость" value={updatedCharacter.dexterity} stat="dexterity" />
        <StatItem icon={FaBrain} label="Интеллект" value={updatedCharacter.intelligence} stat="intelligence" />
        <StatItem icon={FaHeart} label="Выносливость" value={updatedCharacter.endurance} stat="endurance" />
        <StatItem icon={FaSmile} label="Харизма" value={updatedCharacter.charisma} stat="charisma" />
        <div className="mt-2">Доступные очки: {updatedCharacter.availablePoints}</div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Боевые характеристики</h3>
        <StatItem icon={FaFistRaised} label="Урон" value={calculateDamage()} />
        <StatItem icon={FaShieldAlt} label="Броня" value={calculateArmor()} />
        <StatItem icon={FaBullseye} label="Крит" value={calculateCrit()} />
        <StatItem icon={FaWind} label="Уворот" value={calculateDodge()} />
        <StatItem icon={FaHeartbeat} label="Восстановление" value={`${calculateHealthRegen().toFixed(2)}/сек`} />
      </div>
    </div>
  );
};

export default CharacterInfo;