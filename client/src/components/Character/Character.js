import React from 'react';

const Character = ({ character }) => {
//  const expPercentage = character.experience ? (character.experience / 100) * 100 : 0;
//  const healthPercentage = character.maxHealth ? (character.health / character.maxHealth) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-12 grid-rows-17 gap-1">
        <div className="col-span-12 text-center text-xl font-bold flex items-center justify-center">
          {character.name} 
          <span className="ml-2 bg-blue-500 text-white rounded-md w-6 h-6 flex items-center justify-center text-sm">
            {character.level}
          </span>
        </div>
        
        {/* EXP Bar */}
        <div className="col-span-6 col-start-4 row-start-2 bg-yellow-200 rounded-md overflow-hidden">
          <div 
            className="h-full bg-yellow-400 flex items-center justify-center text-xs font-bold"
          >
            EXP: {character.experience}/100
          </div>
        </div>
        
        {/* HP Bar */}
        <div className="col-span-6 col-start-4 row-start-3 bg-red-200 rounded-md overflow-hidden">
          <div 
            className="h-full bg-red-500 flex items-center justify-center text-xs font-bold text-white"
          >
            HP: {character.health}/{character.maxHealth}
          </div>
        </div>

        {/* Character silhouette */}
        <div className="col-span-6 row-span-8 col-start-4 row-start-4 bg-gray-300 rounded-md flex items-center justify-center">
          <img src="https://placehold.co/200x300?text=Character" alt="Character Silhouette" className="w-full h-full object-cover rounded-md" />
        </div>

        {/* Banner */}
        <div className="col-span-3 row-span-3 row-start-2 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Banner" alt="Banner" className="w-full h-full object-cover" />
        </div>

        {/* Helmet */}
        <div className="col-span-3 row-span-3 col-start-10 row-start-2 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Helmet" alt="Helmet" className="w-full h-full object-cover" />
        </div>

        {/* Weapon */}
        <div className="col-span-3 row-span-3 row-start-5 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Weapon" alt="Weapon" className="w-full h-full object-cover" />
        </div>

        {/* Shield */}
        <div className="col-span-3 row-span-3 col-start-10 row-start-5 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Shield" alt="Shield" className="w-full h-full object-cover" />
        </div>

        {/* Armor */}
        <div className="col-span-3 row-span-3 row-start-8 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Armor" alt="Armor" className="w-full h-full object-cover" />
        </div>

        {/* Cloak */}
        <div className="col-span-3 row-span-3 col-start-10 row-start-8 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Cloak" alt="Cloak" className="w-full h-full object-cover" />
        </div>

        {/* Belt */}
        <div className="col-span-3 row-span-3 row-start-11 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Belt" alt="Belt" className="w-full h-full object-cover" />
        </div>

        {/* Boots */}
        <div className="col-span-3 row-span-3 col-start-10 row-start-11 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/60x60?text=Boots" alt="Boots" className="w-full h-full object-cover" />
        </div>

        {/* Inventory items */}
        <div className="col-span-2 row-span-2 col-start-4 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Item+1" alt="Item 1" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-2 col-start-6 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Item+2" alt="Item 2" className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2 row-span-2 col-start-8 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <img src="https://placehold.co/40x40?text=Item+3" alt="Item 3" className="w-full h-full object-cover" />
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
      </div>
    </div>
  );
};

export default Character;