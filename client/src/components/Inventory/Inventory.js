import React, { useState } from 'react';
import FilterSortPanel from '../Interface/FilterSortPanel';
import InventorySlot from './InventorySlot';

const Inventory = ({ inventory, onEquipItem, onShowItemInfo, canEquipItem }) => {
  const [filteredInventory, setFilteredInventory] = useState(inventory);

  return (
    <div>
      <FilterSortPanel
        items={inventory}
        onFilterSort={setFilteredInventory}
        itemType="inventory"
      />
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
                onClickInventoryItem={onEquipItem}
                onShowInfo={() => onShowItemInfo(item)}
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
                onClickInventoryItem={onEquipItem}
                onShowInfo={() => onShowItemInfo(item)}
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
    </div>
  );
};

export default Inventory;