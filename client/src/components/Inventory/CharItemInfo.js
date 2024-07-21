import React from 'react';
import { getCharItemStyle } from '../../utils/charItemUtils';

const CharItemInfo = ({ charItem, onClose, character }) => {
  if (!charItem || !charItem.gameItem) return null;

  const { gameItem } = charItem;
  const itemStyle = getCharItemStyle(gameItem.rarity);

  const isStatInsufficient = (stat, requiredValue) => {
    const characterStat = character[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`];
    return characterStat < requiredValue;
  };

  const rarityColors = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-600',
    rare: 'bg-blue-600',
    epic: 'bg-purple-600',
    legendary: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
      <div className={`relative p-6 ${rarityColors[gameItem.rarity]} text-white`}>
        <h2 className="text-2xl font-bold mb-2">{gameItem.name}</h2>
        <p className="text-white opacity-90">{gameItem.type} - {gameItem.rarity.charAt(0).toUpperCase() + gameItem.rarity.slice(1)}</p>
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="flex mb-4">
          <img src={gameItem.image || "https://placehold.co/100x100?text=No+Image"} alt={gameItem.name} className="w-24 h-24 object-cover mr-4 rounded-lg shadow" style={{borderColor: itemStyle.borderColor, borderWidth: '2px'}} />
          <div>
            <p className="mb-1">
              <span className="font-semibold">Мин. уровень:</span> 
              <span className={character.level < gameItem.minLevel ? "text-red-500 font-bold" : ""}> {gameItem.minLevel}</span>
            </p>
            <p className="mb-1">
              <span className="font-semibold">Класс:</span> 
              <span className={!gameItem.requiredClass.includes(character.class) ? "text-red-500 font-bold" : ""}> {gameItem.requiredClass.join(', ')}</span>
            </p>
          </div>
        </div>
        {Object.keys(gameItem.requiredStats).some(stat => gameItem.requiredStats[stat] > 0) && (
          <div className="mb-4 p-3 bg-white rounded shadow">
            <h3 className="font-bold mb-2">Требуемые характеристики:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gameItem.requiredStats).map(([stat, value]) => (
                value > 0 && (
                  <p key={stat} className={isStatInsufficient(stat, value) ? "text-red-500 font-bold" : ""}>
                    <strong>{stat}:</strong> {value}
                  </p>
                )
              ))}
            </div>
          </div>
        )}
        <div className="mb-4 p-3 bg-white rounded shadow">
          <h3 className="font-bold mb-2">Бонусы:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(gameItem.stats).map(([stat, value]) => (
              value !== 0 && <p key={stat}><strong>{stat}:</strong> {value > 0 ? '+' : ''}{value}</p>
            ))}
          </div>
        </div>
        {gameItem.description && (
          <p className="text-sm italic text-gray-600 mt-4">{gameItem.description}</p>
        )}
        {charItem.isEquipped && (
          <p className="mt-4 text-green-600 font-bold">Экипировано</p>
        )}
      </div>
    </div>
  );
};

export default CharItemInfo;