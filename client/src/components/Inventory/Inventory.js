import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APP_SERVER_URL } from '../../config/config';

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

const InventorySlot = ({ inventoryItem, onClickInventoryItem }) => {
  const [itemDetails, setItemDetails] = useState(null);

  useEffect(() => {
    if (inventoryItem && inventoryItem._id) {
      fetchItemDetails(inventoryItem._id);
    }
  }, [inventoryItem]);

  const fetchItemDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Токен отсутствует.');
        return;
      }
      const response = await axios.get(`${APP_SERVER_URL}/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItemDetails(response.data);
    } catch (error) {
      console.error('Error fetching item details:', error.response?.data || error.message);
    }
  };

  return (
    <div
      className={`aspect-square border border-gray-300 rounded-md flex flex-col justify-end items-center p-1 text-xs text-center cursor-pointer transition-colors duration-200 hover:bg-gray-100 overflow-hidden relative ${
        itemDetails ? 'bg-cover bg-center' : 'bg-transparent'
      }`}
      style={itemDetails ? { backgroundImage: `url(${itemDetails.image || "https://placehold.co/100"})` } : {}}
      onClick={() => inventoryItem && onClickInventoryItem(inventoryItem._id, itemDetails?.type)}
    >
      {itemDetails && (
        <>
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 bg-gray-800 bg-opacity-75 text-white px-1 py-0.5 rounded">
            <div className="font-bold truncate w-full">{itemDetails.name}</div>
            <div>x{inventoryItem.quantity}</div>
          </div>
        </>
      )}
    </div>
  );
};

const Inventory = ({ inventory, onClickInventoryItem }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'equipment', name: 'Экипировка' },
    { id: 'resource', name: 'Ресурсы' },
    { id: 'misc', name: 'Разное' },
  ];

  const filteredInventory = inventory.filter(inventoryItem => 
    activeCategory === 'all' || inventoryItem.type === activeCategory
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
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 gap-1 bg-gray-200 p-2 rounded-b-lg rounded-tr-lg">
        {filteredInventory.map((inventoryItem, index) => (
          <InventorySlot key={index} inventoryItem={inventoryItem} onClickInventoryItem={onClickInventoryItem} />
        ))}
        {[...Array(24 - filteredInventory.length)].map((_, index) => (
          <InventorySlot key={`empty-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default Inventory;