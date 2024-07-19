import React from 'react';

const CharItemInfo = ({ charItem, onClose, character }) => {
  if (!charItem || !charItem.gameItem) return null;

  const { gameItem } = charItem;

  const isStatInsufficient = (stat, requiredValue) => {
    const characterStat = character[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`];
    return characterStat < requiredValue;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
      <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600">
        <h2 className="text-2xl font-bold text-white mb-2">{gameItem.name}</h2>
        <p className="text-blue-100">{gameItem.type} - {gameItem.rarity}</p>
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6">
        <div className="flex mb-4">
          <img src={gameItem.image || "https://placehold.co/100x100?text=No+Image"} alt={gameItem.name} className="w-24 h-24 object-cover mr-4 rounded-lg shadow" />
          <div>
            <p className="mb-1"><span className="font-semibold">Мин. уровень:</span> 
              <span className={character.level < gameItem.minLevel ? "text-red-500 font-bold" : ""}> {gameItem.minLevel}</span>
            </p>
            <p className="mb-1"><span className="font-semibold">Класс:</span> 
              <span className={!gameItem.requiredClass.includes(character.class) ? "text-red-500 font-bold" : ""}> {gameItem.requiredClass.join(', ')}</span>
            </p>
          </div>
        </div>
        {Object.keys(gameItem.requiredStats).some(stat => gameItem.requiredStats[stat] > 0) && (
          <div className="mb-4">
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
        <div className="mb-4">
          <h3 className="font-bold mb-2">Бонусы:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(gameItem.stats).map(([stat, value]) => (
              value !== 0 && <p key={stat}><strong>{stat}:</strong> {value > 0 ? '+' : ''}{value}</p>
            ))}
          </div>
        </div>
        {gameItem.description && (
          <p className="text-sm italic text-gray-600">{gameItem.description}</p>
        )}
        {charItem.isEquipped && (
          <p className="mt-4 text-green-600 font-bold">Экипировано</p>
        )}
      </div>
    </div>
  );
};

export default CharItemInfo;