import React, { useState } from 'react';
import CharItemInfo from '../Inventory/CharItemInfo';
import CharacterStatus from './CharacterStatus';
import EquipmentSlot from './EquipmentSlot';
import HealthBar from './HealthBar';
import CharacterSilhouette from './CharacterSilhouette';

const Character = ({ character, onUnequipItem, onDeleteItem }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!character) {
    return <div>Загрузка персонажа...</div>;
  }

  const handleShowInfo = (charItem) => {
    setSelectedItem(charItem);
  };

  const getEquippedCharItem = (slot) => {
    return character.inventory && character.inventory.find(charItem => charItem.isEquipped && charItem.slot === slot);
  };

  const equipmentSlots = [
    { slot: 'banner', col: '1', row: '2' },
    { slot: 'helmet', col: '10', row: '2' },
    { slot: 'weapon', col: '1', row: '5' },
    { slot: 'shield', col: '10', row: '5' },
    { slot: 'armor', col: '1', row: '8' },
    { slot: 'cloak', col: '10', row: '8' },
    { slot: 'belt', col: '1', row: '11' },
    { slot: 'boots', col: '10', row: '11' },
  ];

  const usefulSlots = ['useful1', 'useful2', 'useful3'];

  const skillSlots = [
    { col: '1', row: '16', text: 'Skill 1' },
    { col: '3', row: '16', text: 'Skill 2' },
    { col: '5', row: '16', text: 'Skill 3' },
    { col: '7', row: '16', text: 'Skill 4' },
    { col: '9', row: '16', text: 'Skill 5' },
    { col: '11', row: '16', text: 'Skill 6' },
  ];

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

        <HealthBar currentHealth={character.healthData.currentHealth} maxHealth={character.healthData.maxHealth} />

        <CharacterSilhouette character={character} />

        {equipmentSlots.map(({ slot, col, row }) => (
          <div key={slot} className={`col-span-3 row-span-3 col-start-${col} row-start-${row} bg-white rounded-md flex items-center justify-center overflow-hidden`}>
            <EquipmentSlot
              slot={slot}
              item={getEquippedCharItem(slot)}
              onUnequip={onUnequipItem}
              onShowInfo={handleShowInfo}
            />
          </div>
        ))}

        {usefulSlots.map((slot, index) => (
          <div key={slot} className={`col-span-2 row-span-2 col-start-${4 + index * 2} row-start-15 bg-white rounded-md flex items-center justify-center overflow-hidden`}>
            <EquipmentSlot
              slot={slot}
              item={getEquippedCharItem(slot)}
              onUnequip={onUnequipItem}
              onShowInfo={handleShowInfo}
            />
          </div>
        ))}

        {skillSlots.map(({ col, row, text }, index) => (
          <div key={index} className={`col-span-2 row-span-2 col-start-${col} row-start-${row} bg-white rounded-md flex items-center justify-center overflow-hidden`}>
            <img src={`https://placehold.co/40x40?text=${text}`} alt={text} className="w-full h-full object-cover" />
          </div>
        ))}

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
            onDeleteItem={onDeleteItem}
          />
        </div>
      )}
    </div>
  );
};

export default Character;