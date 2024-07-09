import React from 'react';
import { FaHeart, FaStar } from 'react-icons/fa';

const Character = ({ character }) => {
  const expPercentage = character.experience ? (character.experience / 100) * 100 : 0;
  const healthPercentage = character.maxHealth ? (character.health / character.maxHealth) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-12 grid-rows-17 gap-0">
        <div className="col-span-12 text-center text-xl font-bold">
          {character.name} [Уровень {character.level}]
        </div>
        
        {/* EXP Bar */}
        <div className="col-span-6 col-start-4 row-start-2 bg-yellow-200 rounded overflow-hidden">
          <div 
            className="h-full bg-yellow-400 flex items-center justify-center text-xs font-bold"
            style={{width: `${expPercentage}%`}}
          >
            <FaStar className="mr-1" /> {character.experience}/100
          </div>
        </div>
        
        {/* HP Bar */}
        <div className="col-span-6 col-start-4 row-start-3 bg-red-200 rounded overflow-hidden">
          <div 
            className="h-full bg-red-500 flex items-center justify-center text-xs font-bold text-white"
            style={{width: `${healthPercentage}%`}}
          >
            <FaHeart className="mr-1" /> {character.health}/{character.maxHealth}
          </div>
        </div>

        {/* Character silhouette */}
        <div className="col-span-6 row-span-10 col-start-4 row-start-4 bg-gray-300 rounded flex items-center justify-center">
          Силуэт
        </div>

        {/* Banner */}
        <div className="col-span-3 row-span-3 row-start-2 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.banner ? character.equipment.banner.name : 
            <img src="https://placehold.co/60x80?text=Banner" alt="Empty Banner" className="w-full h-full object-cover" />
          }
        </div>

        {/* Helmet */}
        <div className="col-span-3 row-span-3 col-start-10 row-start-2 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.helmet ? character.equipment.helmet.name : 
            <img src="https://placehold.co/60x60?text=Helmet" alt="Empty Helmet" className="w-full h-full object-cover" />
          }
        </div>

        {/* Weapon */}
        <div className="col-span-3 row-span-4 row-start-5 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.weapon ? character.equipment.weapon.name : 
            <img src="https://placehold.co/60x80?text=Weapon" alt="Empty Weapon" className="w-full h-full object-cover" />
          }
        </div>

        {/* Shield */}
        <div className="col-span-3 row-span-4 col-start-10 row-start-5 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.shield ? character.equipment.shield.name : 
            <img src="https://placehold.co/60x80?text=Shield" alt="Empty Shield" className="w-full h-full object-cover" />
          }
        </div>

        {/* Armor */}
        <div className="col-span-3 row-span-5 row-start-9 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.armor ? character.equipment.armor.name : 
            <img src="https://placehold.co/60x100?text=Armor" alt="Empty Armor" className="w-full h-full object-cover" />
          }
        </div>

        {/* Cloak */}
        <div className="col-span-3 row-span-5 col-start-10 row-start-9 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.cloak ? character.equipment.cloak.name : 
            <img src="https://placehold.co/60x100?text=Cloak" alt="Empty Cloak" className="w-full h-full object-cover" />
          }
        </div>

        {/* Belt */}
        <div className="col-span-3 row-span-2 row-start-14 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.belt ? character.equipment.belt.name : 
            <img src="https://placehold.co/60x40?text=Belt" alt="Empty Belt" className="w-full h-full object-cover" />
          }
        </div>

        {/* Inventory items */}
        <div className="col-span-2 row-span-2 col-start-4 row-start-14 bg-green-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">🧪</span>
          Item 1
        </div>
        <div className="col-span-2 row-span-2 col-start-6 row-start-14 bg-green-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">🧫</span>
          Item 2
        </div>
        <div className="col-span-2 row-span-2 col-start-8 row-start-14 bg-green-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">📜</span>
          Item 3
        </div>
		
        {/* Boots */}
        <div className="col-span-3 row-span-2 col-start-10 row-start-14 bg-white rounded flex items-center justify-center text-xs font-semibold">
          {character.equipment?.boots ? character.equipment.boots.name : 
            <img src="https://placehold.co/60x40?text=Boots" alt="Empty Boots" className="w-full h-full object-cover" />
          }
        </div>

        {/* Skills */}
        <div className="col-span-2 row-span-2 row-start-16 bg-blue-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">🗡️</span>
          Skill 1
        </div>
        <div className="col-span-2 row-span-2 col-start-3 row-start-16 bg-blue-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">🛡️</span>
          Skill 2
        </div>
        <div className="col-span-2 row-span-2 col-start-5 row-start-16 bg-blue-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">🏹</span>
          Skill 3
        </div>
        <div className="col-span-2 row-span-2 col-start-7 row-start-16 bg-blue-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">🔥</span>
          Skill 4
        </div>
        <div className="col-span-2 row-span-2 col-start-9 row-start-16 bg-blue-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">❄️</span>
          Skill 5
        </div>
        <div className="col-span-2 row-span-2 col-start-11 row-start-16 bg-blue-200 rounded flex flex-col items-center justify-center text-xs font-semibold">
          <span className="text-2xl mb-1">⚡</span>
          Skill 6
        </div>
      </div>
    </div>
  );
};

export default Character;