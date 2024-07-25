import React, { useState } from 'react';
import CharItemInfo from './CharItemInfo';
import { getCharItemStyle, getEquippedCharItemStyle } from '../../utils/charItemUtils';
import FilterSortPanel from '../Interface/FilterSortPanel';

const InventorySlot = ({ inventoryItem, onClickInventoryItem, onShowInfo, canEquipItem }) => {
  const [pressTimer, setPressTimer] = useState(null);

  const handleMouseDown = () => {
    setPressTimer(setTimeout(() => {
      if (inventoryItem) {
        onShowInfo(inventoryItem);
      }
    }, 1000));
  };

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
        {inventoryItem.gameItem.isStackable && (
          <div>
            {inventoryItem.displayQuantity}/{inventoryItem.gameItem.maxQuantity}
          </div>
        )}
        {inventoryItem.stacksCount > 1 && (
          <div className="text-xs text-gray-300">x{inventoryItem.stacksCount}</div>
        )}
      </div>
    </div>
  );
};

const Inventory = ({ inventory, onClickInventoryItem, equipError, canEquipItem, character }) => {
  const [filteredInventory, setFilteredInventory] = useState(inventory);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleShowInfo = (item) => {
    setSelectedItem(item);
  };

  const handleDeleteItem = (deletedItemId, deletedQuantity) => {
    setFilteredInventory(prevInventory => {
      const updatedInventory = prevInventory.map(item => {
        if (item._id === deletedItemId) {
          const newQuantity = item.quantity - deletedQuantity;
          if (newQuantity <= 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean);
      return updatedInventory;
    });
  };

  return (
    <div>
      <FilterSortPanel
        items={inventory}
        onFilterSort={setFilteredInventory}
        itemType="inventory"
      />
      {equipError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{equipError}</span>
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 gap-1 bg-gray-200 p-2 rounded-lg">
        {filteredInventory.flatMap((item) => {
          const fullStacks = Math.floor(item.quantity / item.gameItem.maxQuantity);
          const remainingItems = item.quantity % item.gameItem.maxQuantity;

          return [
            ...Array(fullStacks).fill().map((_, index) => (
              <InventorySlot
                key={`${item._id}-${index}`}
                inventoryItem={{
                  ...item,
                  displayQuantity: item.gameItem.maxQuantity,
                  isFullStack: true
                }}
                onClickInventoryItem={onClickInventoryItem}
                onShowInfo={() => handleShowInfo(item)}
                canEquipItem={canEquipItem}
              />
            )),
            remainingItems > 0 && (
              <InventorySlot
                key={`${item._id}-${fullStacks}`}
                inventoryItem={{
                  ...item,
                  displayQuantity: remainingItems,
                  isFullStack: false
                }}
                onClickInventoryItem={onClickInventoryItem}
                onShowInfo={() => handleShowInfo(item)}
                canEquipItem={canEquipItem}
              />
            )
          ].filter(Boolean);
        })}
        {Array.from({ length: Math.max(0, 24 - filteredInventory.reduce((acc, item) => acc + Math.ceil(item.quantity / item.gameItem.maxQuantity), 0)) }).map((_, index) => (
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