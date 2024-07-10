import React, { useState } from 'react';

const CategoryTab = ({ id, name, active, onClick }) => (
  <button
    className={`px-4 py-2 font-bold transition-colors duration-200 
      ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
      first:rounded-tl-lg last:rounded-tr-lg`}
    onClick={() => onClick(id)}
  >
    {name}
  </button>
);

const ItemSlot = ({ item, onEquipItem }) => (
  <div
    className="aspect-square bg-white border border-gray-300 rounded-md flex flex-col justify-center items-center p-1 text-xs text-center cursor-pointer transition-colors duration-200 hover:bg-gray-100"
    onClick={() => item && onEquipItem(item.id, item.slot)}
  >
    {item && (
      <>
        <div className="font-bold mb-1 text-gray-800 truncate w-full">{item.name}</div>
        <div className="text-gray-600">x{item.quantity}</div>
      </>
    )}
  </div>
);

const Inventory = ({ inventory, onEquipItem }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'weapon', name: 'Оружие' },
    { id: 'armor', name: 'Броня' },
    { id: 'potion', name: 'Зелья' },
    { id: 'misc', name: 'Предметы' },
  ];

  const filteredInventory = inventory.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div>
      <div className="flex mt-4">
        {categories.map(category => (
          <CategoryTab
            key={category.id}
            id={category.id}
            name={category.name}
            active={activeCategory === category.id}
            onClick={setActiveCategory}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-7 gap-1 bg-gray-200 p-2 rounded-b-lg rounded-tr-lg">
        {filteredInventory.map((item, index) => (
          <ItemSlot key={index} item={item} onEquipItem={onEquipItem} />
        ))}
        {[...Array(24 - filteredInventory.length)].map((_, index) => (
          <ItemSlot key={`empty-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default Inventory;