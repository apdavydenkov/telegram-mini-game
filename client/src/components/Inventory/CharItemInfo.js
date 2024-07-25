import React, { useState, useEffect } from 'react';
import { getCharItemStyle, getEquippedCharItemStyle } from '../../utils/charItemUtils';
import { charItem } from '../../services/api';

const CharItemInfo = ({ charItem: initialCharItem, onClose, character, onEquipItem, onDeleteItem }) => {
  const [isEquipped, setIsEquipped] = useState(initialCharItem.isEquipped);
  const [deleteQuantity, setDeleteQuantity] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsEquipped(initialCharItem.isEquipped);
  }, [initialCharItem.isEquipped]);

  if (!initialCharItem || !initialCharItem.gameItem) return null;

  const { gameItem } = initialCharItem;
  const itemStyle = isEquipped ? getEquippedCharItemStyle(gameItem.rarity) : getCharItemStyle(gameItem.rarity);

  const isStatInsufficient = (stat, requiredValue) => {
    const characterStat = character[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`];
    return characterStat < requiredValue;
  };

  const rarityColors = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-600',
    rare: 'bg-blue-600',
    epic: 'bg-purple-600',
    legendary: 'bg-orange-500'
  };

  const canEquipItem = () => {
    if (character.level < gameItem.minLevel) return false;
    if (gameItem.requiredClass.length && !gameItem.requiredClass.includes(character.class)) return false;
    for (const [stat, value] of Object.entries(gameItem.requiredStats)) {
      if (character[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`] < value) return false;
    }
    return true;
  };

  const handleEquipToggle = async () => {
    await onEquipItem(initialCharItem._id);
    setIsEquipped(!isEquipped);
  };

  const handleDeleteConfirm = async () => {
    if (isEquipped) {
      alert('Нельзя удалить экипированный предмет');
      return;
    }
    
    try {
      if (gameItem.isStackable && deleteQuantity < initialCharItem.quantity) {
        await charItem.update(initialCharItem._id, { quantity: initialCharItem.quantity - deleteQuantity });
        if (typeof onDeleteItem === 'function') {
          onDeleteItem(initialCharItem._id, deleteQuantity);
        }
      } else {
        await charItem.delete(initialCharItem._id);
        if (typeof onDeleteItem === 'function') {
          onDeleteItem(initialCharItem._id, initialCharItem.quantity);
        }
      }
      onClose();
    } catch (error) {
      console.error('Ошибка удаления предмета:', error);
      alert('Не удалось удалить предмет');
    }
  };

return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
      <div className={`relative p-6 ${rarityColors[gameItem.rarity]} text-white`}>
        <h2 className="text-2xl font-bold mb-2">{gameItem.name}</h2>
        <p className="text-white opacity-90">{gameItem.type} - {gameItem.rarity.charAt(0).toUpperCase() + gameItem.rarity.slice(1)}</p>
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="flex mb-4">
          <div className="w-24 h-24 mr-4 rounded-lg shadow overflow-hidden" style={itemStyle}>
            <img src={gameItem.image || "https://placehold.co/100x100?text=No+Image"} alt={gameItem.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="mb-1">
              <span className="font-semibold">Мин. уровень:</span> 
              <span className={character.level < gameItem.minLevel ? "text-red-500 font-bold" : ""}> {gameItem.minLevel}</span>
            </p>
            <p className="mb-1">
              <span className="font-semibold">Класс:</span> 
              <span className={!gameItem.requiredClass.includes(character.class) ? "text-red-500 font-bold" : ""}> {gameItem.requiredClass.join(', ')}</span>
            </p>
            {gameItem.isStackable && (
              <p className="mb-1">
                <span className="font-semibold">Количество:</span> {initialCharItem.quantity}
              </p>
            )}
          </div>
        </div>
        {Object.keys(gameItem.requiredStats).some(stat => gameItem.requiredStats[stat] > 0) && (
          <div className="mb-4 p-3 bg-white rounded shadow">
            <h3 className="font-bold mb-2">Требуемые характеристики:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gameItem.requiredStats).map(([stat, value]) => (
                value > 0 && (
                  <p key={stat} className={isStatInsufficient(stat, value) ? "text-red-500 font-bold" : ""}>
                    <strong>{stat}:</strong> {value}
                  </p>
                )
              ))}
            </div>
          </div>
        )}
        <div className="mb-4 p-3 bg-white rounded shadow">
          <h3 className="font-bold mb-2">Бонусы:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(gameItem.stats).map(([stat, value]) => (
              value !== 0 && <p key={stat}><strong>{stat}:</strong> {value > 0 ? '+' : ''}{value}</p>
            ))}
          </div>
        </div>
        {gameItem.description && (
          <p className="text-sm italic text-gray-600 mt-4">{gameItem.description}</p>
        )}
        {isEquipped ? (
          <p className="mt-4 text-green-600 font-bold">Экипировано</p>
        ) : null}
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleEquipToggle}
            className={`px-4 py-2 rounded ${
              canEquipItem() || isEquipped
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!canEquipItem() && !isEquipped}
          >
            {isEquipped ? 'Снять' : 'Надеть'}
          </button>
          {!isEquipped && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Удалить
            </button>
          )}
        </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Подтвердите удаление</h3>
              {gameItem.isStackable && (
                <div className="mb-4">
                  <label className="block mb-2">Количество для удаления:</label>
                  <input
                    type="number"
                    min="1"
                    max={initialCharItem.quantity}
                    value={deleteQuantity}
                    onChange={(e) => setDeleteQuantity(Math.max(1, Math.min(initialCharItem.quantity, parseInt(e.target.value) || 1)))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 mr-2"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharItemInfo;