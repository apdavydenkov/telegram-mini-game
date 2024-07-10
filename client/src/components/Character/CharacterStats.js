import React from 'react';
import { FaDumbbell, FaRunning, FaBrain, FaFistRaised, FaShieldAlt, FaBullseye, FaWind, FaHeartbeat } from 'react-icons/fa';

const CharacterInfo = ({ character, onCharacterUpdate, showDetailedStats }) => {
  const calculateDamage = () => character.strength * 10;
  const calculateArmor = () => character.strength * 5;
  const calculateCrit = () => (character.strength * 3) + (character.dexterity * 3);
  const calculateDodge = () => (character.dexterity * 3) + (character.intelligence * 3);
  const calculateHealthRegen = () => 1 + (character.intelligence * 0.05);

	const StatItem = ({ icon: Icon, label, value }) => (
	  <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm mb-2">
		<span className="flex items-center text-gray-700">
		  <Icon className="mr-2 text-blue-500" />
		  {label}:
		</span>
		<span className="font-semibold text-blue-600">{value}</span>
	  </div>
	);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Навыки</h3>
        <StatItem icon={FaDumbbell} label="Сила" value={character.strength} />
        <StatItem icon={FaRunning} label="Ловкость" value={character.dexterity} />
        <StatItem icon={FaBrain} label="Интеллект" value={character.intelligence} />
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Характеристики</h3>
        <StatItem icon={FaFistRaised} label="Урон" value={calculateDamage()} />
        <StatItem icon={FaShieldAlt} label="Броня" value={calculateArmor()} />
        <StatItem icon={FaBullseye} label="Крит" value={calculateCrit()} />
        <StatItem icon={FaWind} label="Уворот" value={calculateDodge()} />
        <StatItem icon={FaHeartbeat} label="Реген" value={`${calculateHealthRegen().toFixed(2)}/сек`} />
      </div>
    </div>
  );
};

export default CharacterInfo;