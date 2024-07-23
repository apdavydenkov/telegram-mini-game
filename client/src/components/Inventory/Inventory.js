import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CharItemInfo from './CharItemInfo';
import { getCharItemStyle, getEquippedCharItemStyle } from '../../utils/charItemUtils';

const InventorySlot = ({ inventoryItem, onClickInventoryItem, onShowInfo, canEquipItem }) => {
  const [pressTimer, setPressTimer] = useState(null);

  const handleMouseDown = useCallback(() => {
    setPressTimer(setTimeout(() => {
      if (inventoryItem) {
        onShowInfo(inventoryItem);
      }
    }, 1000));
  }, [inventoryItem, onShowInfo]);

  const handleMouseUp = () => {
    clearTimeout(pressTimer);
  };

  const handleClick = () => {
    if (inventoryItem) {
      if (canEquipItem(inventoryItem)) {
        onClickInventoryItem(inventoryItem._id);
      } else {
        onShowInfo(inventoryItem);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  if (!inventoryItem) return null;

  const itemStyle = inventoryItem.isEquipped
    ? getEquippedCharItemStyle(inventoryItem.gameItem.rarity)
    : getCharItemStyle(inventoryItem.gameItem.rarity);

  return (
    <div
      className={`aspect-square rounded-md flex flex-col justify-end items-center p-1 text-xs text-center cursor-pointer transition-colors duration-200 hover:bg-opacity-80 overflow-hidden relative bg-cover bg-center`}
      style={{
        ...itemStyle,
        backgroundImage: `url(${inventoryItem.gameItem.image || "https://placehold.co/100"})`
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="relative z-10 bg-gray-800 bg-opacity-75 text-white px-1 py-0.5 rounded">
        <div className="font-bold truncate w-full">{inventoryItem.gameItem.name}</div>
        <div>x{inventoryItem.quantity}</div>
      </div>

    </div>
  );
};

const Inventory = ({ inventory, onClickInventoryItem, equipError, canEquipItem, character }) => {
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('none');
  const [filterValue, setFilterValue] = useState('all');
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');

  const filterCategories = useMemo(() => [
    { value: 'none', label: 'Без фильтра' },
    { value: 'type', label: 'По типу' },
    { value: 'rarity', label: 'По редкости' },
    { value: 'class', label: 'По классу' },
  ], []);

  const filterOptions = useMemo(() => ({
    type: [
      { value: 'all', label: 'Все типы' },
      { value: 'weapon', label: 'Оружие' },
      { value: 'armor', label: 'Броня' },
      { value: 'helmet', label: 'Шлемы' },
      { value: 'shield', label: 'Щиты' },
      { value: 'cloak', label: 'Плащи' },
      { value: 'belt', label: 'Пояса' },
      { value: 'boots', label: 'Обувь' },
      { value: 'banner', label: 'Знамена' },
      { value: 'useful', label: 'Полезное' },
    ],
    rarity: [
      { value: 'all', label: 'Все редкости' },
      { value: 'common', label: 'Обычные' },
      { value: 'uncommon', label: 'Необычные' },
      { value: 'rare', label: 'Редкие' },
      { value: 'epic', label: 'Эпические' },
      { value: 'legendary', label: 'Легендарные' },
    ],
    class: [
      { value: 'all', label: 'Все классы' },
      { value: 'Warrior', label: 'Воин' },
      { value: 'Mage', label: 'Маг' },
      { value: 'Archer', label: 'Лучник' },
    ],
  }), []);

  const sortOptions = useMemo(() => [
    { value: 'none', label: 'Без сортировки' },
    { value: 'level', label: 'По уровню' },
    { value: 'rarity', label: 'По редкости' },
  ], []);

  useEffect(() => {
    filterAndSortInventory();
  }, [inventory, filterCategory, filterValue, sortBy, sortOrder]);

  const filterAndSortInventory = useCallback(() => {
    let filtered = [...inventory];

    // Apply filter
    if (filterCategory !== 'none' && filterValue !== 'all') {
      filtered = filtered.filter(item => {
        switch (filterCategory) {
          case 'type':
            return item.gameItem?.type === filterValue;
          case 'rarity':
            return item.gameItem?.rarity === filterValue;
          case 'class':
            return item.gameItem?.requiredClass.includes(filterValue);
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    if (sortBy !== 'none') {
      filtered.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'level') {
          comparison = a.gameItem.minLevel - b.gameItem.minLevel;
        } else if (sortBy === 'rarity') {
          comparison = rarityOrder.indexOf(a.gameItem.rarity) - rarityOrder.indexOf(b.gameItem.rarity);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredInventory(filtered);
  }, [inventory, filterCategory, filterValue, sortBy, sortOrder]);

  const handleShowInfo = (item) => {
    setSelectedItem(item);
  };

  const handleDeleteItem = (deletedItemId) => {
    setFilteredInventory(prevInventory => prevInventory.filter(item => item._id !== deletedItemId));
  };

  const renderDropdown = (label, value, onChange, options) => (
    <div className="mb-2 mr-2">
      <label className="mr-2">{label}:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-1 rounded border border-gray-300"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center">
        {renderDropdown('Фильтр', filterCategory, setFilterCategory, filterCategories)}
        {filterCategory !== 'none' && renderDropdown('Значение', filterValue, setFilterValue, filterOptions[filterCategory])}
        {renderDropdown('Сортировка', sortBy, setSortBy, sortOptions)}
        {sortBy !== 'none' && (
          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        )}
      </div>
      {equipError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{equipError}</span>
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 gap-1 bg-gray-200 p-2 rounded-lg">
        {filteredInventory.map((item, index) => (
          <InventorySlot
            key={`${item._id}-${index}`}
            inventoryItem={item}
            onClickInventoryItem={onClickInventoryItem}
            onShowInfo={handleShowInfo}
            canEquipItem={canEquipItem}
          />
        ))}
        {/* Заполняем пустые слоты, чтобы избежать мерцания */}
        {Array.from({ length: Math.max(0, 24 - filteredInventory.length) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square bg-white border border-gray-300 rounded-md flex flex-col justify-center items-center p-1 text-xs text-center"
          />
        ))}
      </div>
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CharItemInfo
            charItem={selectedItem}
            onClose={() => setSelectedItem(null)}
            character={character}
            onEquipItem={onClickInventoryItem}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      )}
    </div>
  );
};

export default Inventory;