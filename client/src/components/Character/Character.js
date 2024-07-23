// ВАЖНО: Порядок и структура div элементов в этом файле критически важны для вёрстки.
// НЕ ИЗМЕНЯЙТЕ порядок или структуру div элементов без крайней необходимости.
// Любые изменения могут нарушить макет персонажа.

import React, { useState, useCallback } from 'react';
import CharItemInfo from '../Inventory/CharItemInfo';
import { getCharItemStyle, getEquippedCharItemStyle } from '../../utils/charItemUtils';
import CharacterStatus from './CharacterStatus';

const EquipmentSlot = ({ slot, item, onUnequip, onShowInfo }) => {
  const [pressTimer, setPressTimer] = useState(null);

  const handleMouseDown = useCallback(() => {
    setPressTimer(setTimeout(() => {
      if (item) {
        onShowInfo(item);
      }
    }, 1000));
  }, [item, onShowInfo]);

  const handleMouseUp = () => {
    clearTimeout(pressTimer);
  };

  const handleClick = () => {
    if (item) {
      onUnequip(item._id);
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center cursor-pointer"
      style={item ? getEquippedCharItemStyle(item.gameItem.rarity) : {}}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {item ? (
        <div className="w-full h-full relative">
          <img 
            src={item.gameItem.image || `https://placehold.co/60x60?text=${slot}`} 
            alt={item.gameItem.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-white text-xs font-bold bg-gray-800 bg-opacity-75 px-1 py-0.5 rounded">
              {item.gameItem.name}
            </div>
          </div>
        </div>
      ) : (
        <img 
          src={`https://placehold.co/60x60?text=${slot}`} 
          alt={slot} 
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

const Character = ({ character, onUnequipItem }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!character) {
    return <div>Загрузка персонажа...</div>;
  }

  const currentHealth = Math.round(character.healthData.currentHealth);
  const maxHealth = character.healthData.maxHealth;

  const handleShowInfo = (item) => {
    setSelectedItem(item);
  };

  const getEquippedItem = (slot) => {
    return character.inventory && character.inventory.find(charItem => charItem.isEquipped && charItem.slot === slot);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-100 p-2 rounded-lg shadow-md">
      <div className="grid grid-cols-12 grid-rows-17 gap-1">
        <div className="col-span-12 text-center text-xl font-bold flex items-center justify-center">
          {character.nickname}
          <span className="ml-2 bg-blue-500 text-white rounded-md w-6 h-6 flex items-center justify-center text-sm">
            {character.level}
          </span>
          <span className="ml-2 bg-gray-300 text-gray-800 rounded-md px-2 py-1 text-xs">
          <CharacterStatus character={character} />
          </span>
        </div>
        
        <div className="col-span-6 col-start-4 row-start-2 bg-yellow-200 rounded-md overflow-hidden relative h-6">
          <div
            className="h-full bg-yellow-400 absolute left-0 top-0"
            style={{ width: `${(character.experience / 100) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            EXP: {character.experience}/100
          </div>
        </div>
        
        <div className="col-span-6 col-start-4 row-start-3 bg-red-200 rounded-md overflow-hidden relative h-6">
          <div
            className="h-full bg-red-500 absolute left-0 top-0"
            style={{ width: `${(currentHealth / maxHealth) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            HP: {currentHealth}/{maxHealth}
          </div>
        </div>

        <div className="col-span-6 row-span-8 col-start-4 row-start-4 bg-gray-300 rounded-md flex items-center justify-center">
          <img src="https://placehold.co/200x300?text=Character" alt="Character Silhouette" className="w-full h-full object-cover rounded-md" />
        </div>

        <div className="col-span-3 row-span-3 row-start-2 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="banner" item={getEquippedItem('banner')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-2 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="helmet" item={getEquippedItem('helmet')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-3 row-span-3 row-start-5 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="weapon" item={getEquippedItem('weapon')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-5 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="shield" item={getEquippedItem('shield')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-3 row-span-3 row-start-8 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="armor" item={getEquippedItem('armor')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-8 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="cloak" item={getEquippedItem('cloak')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-3 row-span-3 row-start-11 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="belt" item={getEquippedItem('belt')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-3 row-span-3 col-start-10 row-start-11 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="boots" item={getEquippedItem('boots')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>

        <div className="col-span-2 row-span-2 col-start-4 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="useful1" item={getEquippedItem('useful1')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-2 row-span-2 col-start-6 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="useful2" item={getEquippedItem('useful2')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>
        <div className="col-span-2 row-span-2 col-start-8 row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden">
          <EquipmentSlot slot="useful3" item={getEquippedItem('useful3')} onUnequip={onUnequipItem} onShowInfo={handleShowInfo} />
        </div>

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

        <div className="col-span-3 row-span-1 col-start-1 row-start-17 bg-yellow-300 rounded-md flex items-center justify-center overflow-hidden">
          <span className="font-bold text-yellow-800">Gold: {character.gold}</span>
        </div>
      </div>
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CharItemInfo 
            charItem={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            character={character}
            onEquipItem={onUnequipItem}
          />
        </div>
      )}
    </div>
  );
};

export default Character;