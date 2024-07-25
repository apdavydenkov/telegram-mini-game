import React from 'react';

const CharacterSilhouette = ({ character }) => {
  return (
    <div className="col-span-6 row-span-8 col-start-4 row-start-4 bg-gray-300 rounded-md flex items-center justify-center relative">
      <img 
        src="https://placehold.co/200x300?text=Character" 
        alt="Character Silhouette" 
        className="w-full h-full object-cover rounded-md"
      />
      {/* Здесь в будущем можно добавить иконки статусов */}
      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
        {/* Пример: <StatusIcon type="poison" /> */}
      </div>
      {/* Здесь в будущем можно добавить боевые характеристики */}
      <div className="absolute bottom-2 right-2 text-white text-sm">
        {/* Пример: <CombatStat name="ATK" value={character.attack} /> */}
      </div>
    </div>
  );
};

export default CharacterSilhouette;