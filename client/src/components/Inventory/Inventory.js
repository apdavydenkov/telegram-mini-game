import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { APP_SERVER_URL } from '../../config/config';
import CharItemInfo from './CharItemInfo';

const InventorySlot = ({ inventoryItem, onClickInventoryItem, onShowInfo, canEquipItem }) => {
  const [itemDetails, setItemDetails] = useState(null);
  const [pressTimer, setPressTimer] = useState(null);

  useEffect(() => {
    if (inventoryItem) {
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
      const response = await axios.get(`${APP_SERVER_URL}/api/charItem/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItemDetails(response.data);
    } catch (error) {
      console.error('Error fetching item details:', error.response?.data || error.message);
    }
  };

  const handleMouseDown = useCallback(() => {
    setPressTimer(setTimeout(() => {
      if (itemDetails) {
        onShowInfo(itemDetails);
      }
    }, 1000));
  }, [itemDetails, onShowInfo]);

  const handleMouseUp = () => {
    clearTimeout(pressTimer);
  };

  const handleClick = () => {
    if (itemDetails) {
      if (canEquipItem(itemDetails)) {
        onClickInventoryItem(inventoryItem._id);
      } else {
        onShowInfo(itemDetails);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  return (
    <div
      className={`aspect-square border border-gray-300 rounded-md flex flex-col justify-end items-center p-1 text-xs text-center cursor-pointer transition-colors duration-200 hover:bg-gray-100 overflow-hidden relative ${itemDetails ? 'bg-cover bg-center' : 'bg-transparent'}`}
      style={itemDetails?.gameItem ? { backgroundImage: `url(${itemDetails.gameItem.image || "https://placehold.co/100"})` } : {}}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {itemDetails && (
        <>
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 bg-gray-800 bg-opacity-75 text-white px-1 py-0.5 rounded">
            <div className="font-bold truncate w-full">{itemDetails.gameItem.name}</div>
            <div>x{itemDetails.quantity}</div>
          </div>
          {itemDetails.isEquipped && (
            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">
              Экипировано
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Inventory = ({ inventory, onClickInventoryItem, equipError, canEquipItem, character }) => {
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'weapon', name: 'Оружие' },
    { id: 'armor', name: 'Броня' },
    { id: 'cloack', name: 'Плащи' },
    { id: 'helmet', name: 'Шлемы' },
    { id: 'belt', name: 'Пояса' },
    { id: 'boots', name: 'Обувь' },
    { id: 'banner', name: 'Знамя' },
    { id: 'useful', name: 'Полезное' },
  ];

  useEffect(() => {
    filterInventory();
  }, [inventory, activeCategory]);

  const filterInventory = () => {
    if (activeCategory === 'all') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(item => item.gameItem?.type === activeCategory);
      setFilteredInventory(filtered);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleShowInfo = (item) => {
    setSelectedItem(item);
  };

  return (
    <div>
      <div className="flex mt-4 overflow-auto">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 font-bold transition-colors duration-200 
              ${activeCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              first:rounded-tl-lg last:rounded-tr-lg`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      {equipError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{equipError}</span>
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 gap-1 bg-gray-200 p-2 rounded-b-lg">
        {filteredInventory.map((item, index) => (
          <InventorySlot
            key={`${item._id}-${index}`}
            inventoryItem={item}
            onClickInventoryItem={onClickInventoryItem}
            onShowInfo={handleShowInfo}
            canEquipItem={canEquipItem}
          />
        ))}
        {Array.from({ length: Math.max(0, 24 - filteredInventory.length) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square bg-white border border-gray-300 rounded-md flex flex-col justify-center items-center p-1 text-xs text-center"
          />
        ))}
      </div>
      {selectedItem && (
        <div className="fixed p-4 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CharItemInfo 
            charItem={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            character={character}
          />
        </div>
      )}
    </div>
  );
};

export default Inventory;