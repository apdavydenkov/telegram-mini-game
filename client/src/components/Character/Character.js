import React from 'react';

const Character = ({ character }) => {
  if (!character) {
    return <div>Загрузка персонажа...</div>;
  }

  const renderEquippedCharItem = (slot) => {
    const equippedCharItem = character.inventory && character.inventory.find(charItem => charItem.isEquipped && charItem.slot === slot);
    return equippedCharItem ? (
      <img src={equippedCharItem.gameItem.image || `https://placehold.co/60x60?text=${equippedCharItem.gameItem.name}`} alt={equippedCharItem.gameItem.name} className="w-full h-full object-cover" />
    ) : (
      <img src={`https://placehold.co/60x60?text=${slot}`} alt={slot} className="w-full h-full object-cover" />
    );
  };

  const currentHealth = Math.round(character.healthData.currentHealth);
  const maxHealth = character.healthData.maxHealth;

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-12 grid-rows-17 gap-1">
        <div className="col-span-12 text-center text-xl font-bold flex items-center justify-center">
          {character.nickname}
          <span className="ml-2 bg-blue-500 text-white rounded-md w-6 h-6 flex items-center justify-center text-sm">
            {character.level}
          </span>
          <span className="ml-2 bg-gray-300 text-gray-800 rounded-md px-2 py-1 text-xs">
            {character.status}
          </span>
        </div>
        
        {/* EXP Bar */}
        <div className="col-span-6 col-start-4 row-start-2 bg-yellow-200 rounded-md overflow-hidden relative h-6">
          <div
            className="h-full bg-yellow-400 absolute left-0 top-0"
            style={{ width: `${(character.experience / 100) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            EXP: {character.experience}/100
          </div>
        </div>
        
        {/* HP Bar */}
        <div className="col-span-6 col-start-4 row-start-3 bg-red-200 rounded-md overflow-hidden relative h-6">
          <div
            className="h-full bg-red-500 absolute left-0 top-0"
            style={{ width: `${(currentHealth / maxHealth) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            HP: {currentHealth}/{maxHealth}
          </div>
        </div>

        {/* Character silhouette */}
        <div className="col-span-6 row-span-8 col-start-4 row-start-4 bg-gray-300 rounded-md flex items-center justify-center">
          <img src="https://placehold.co/200x300?text=Character" alt="Character Silhouette" className="w-full h-full object-cover rounded-md" />
        </div>

        {/* Equipment slots */}
        <div className="col-span-3 row-span-3 row-start-2 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('banner')}
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-2 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('helmet')}
        </div>
        <div className="col-span-3 row-span-3 row-start-5 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('weapon')}
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-5 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('shield')}
        </div>
        <div className="col-span-3 row-span-3 row-start-8 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('armor')}
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-8 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('cloak')}
        </div>
        <div className="col-span-3 row-span-3 row-start-11 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('belt')}
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-11 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('boots')}
        </div>

        {/* Useful item slots */}
        <div className="col-span-2 row-span-2 col-start-4 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('useful1')}
        </div>
        <div className="col-span-2 row-span-2 col-start-6 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('useful2')}
        </div>
        <div className="col-span-2 row-span-2 col-start-8 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          {renderEquippedCharItem('useful3')}
        </div>

        {/* Skills */}
        <div className="col-span-2 row-span-2 row-start-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Skill+1" alt="Skill 1" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-2 col-start-3 row-start-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Skill+2" alt="Skill 2" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-2 col-start-5 row-start-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Skill+3" alt="Skill 3" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-2 col-start-7 row-start-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Skill+4" alt="Skill 4" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-2 col-start-9 row-start-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Skill+5" alt="Skill 5" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-2 col-start-11 row-start-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Skill+6" alt="Skill 6" className="w-full h-full object-cover" />
        </div>

        {/* Gold */}
        <div className="col-span-3 row-span-1 col-start-1 row-start-17 bg-yellow-300 rounded-md flex items-center justify-center overflow-hidden">
          <span className="font-bold text-yellow-800">Gold: {character.gold}</span>
        </div>
      </div>
    </div>
  );
};

export default Character;