import React, { useState, useCallback, useEffect } from 'react';
import { getEquippedItemStyle } from '../../utils/charItemUtils';

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

  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  return (
    <div
      className="w-full h-full flex items-center justify-center cursor-pointer"
      style={item ? getEquippedItemStyle(item.gameItem.rarity) : {}}
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

export default EquipmentSlot;