import React, { useState, useCallback, useEffect } from 'react';
import { getCharItemStyle, getEquippedItemStyle } from '../../utils/charItemUtils';


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
        ? getEquippedItemStyle(inventoryItem.gameItem.rarity)
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

export default InventorySlot;