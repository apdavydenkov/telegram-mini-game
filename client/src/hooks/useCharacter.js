import { useState, useEffect, useCallback, useRef } from 'react';
import { characterAPI, charItemAPI } from '../services/api';

const useCharacter = () => {
  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const healthUpdateInterval = useRef(null);

  const fetchCharacter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await characterAPI.get();
      if (data) {
        setCharacterData(data);
      } else {
        setCharacterData(null);
      }
    } catch (err) {
      console.error('Error fetching character:', err);
      if (err.response && err.response.status === 401) {
        setIsSessionExpired(true);
      } else {
        setError('Failed to load character data');
      }
      setCharacterData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHealth = useCallback(() => {
    if (!characterData) return;

    const now = new Date();
    const healthRegenDuration = Math.max(0, (now - new Date(characterData.healthData.lastHealthUpdate)) / 1000);
    const healthRegenAmount = characterData.calculatedStats.healthRegenRate * healthRegenDuration;
    const newHealth = Math.min(
      characterData.healthData.currentHealth + healthRegenAmount,
      characterData.healthData.maxHealth
    );

    setCharacterData(prevData => ({
      ...prevData,
      healthData: {
        ...prevData.healthData,
        currentHealth: Math.round(newHealth * 100) / 100,
        lastHealthUpdate: now.toISOString()
      }
    }));
  }, [characterData]);

  const updateCharacter = useCallback(async (updatedData) => {
    if (isUpdating) {
      setError('Please wait, character is being updated...');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const { data } = await characterAPI.update(updatedData);
      setCharacterData(data);
    } catch (err) {
      console.error('Error updating character:', err);
      setError('Failed to update character data. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating]);

  const deleteItem = async (charItemId, deleteQuantity) => {
    try {
      const charItem = characterData.inventory.find(item => item._id === charItemId);
      if (!charItem) throw new Error('Предмет не найден');

      if (charItem.isEquipped) {
        throw new Error('Нельзя удалить экипированный предмет');
      }

      if (charItem.gameItem.isStackable && deleteQuantity < charItem.quantity) {
        await charItemAPI.update(charItemId, { quantity: charItem.quantity - deleteQuantity });
        setCharacterData(prevData => ({
          ...prevData,
          inventory: prevData.inventory.map(item =>
            item._id === charItemId
              ? { ...item, quantity: item.quantity - deleteQuantity }
              : item
          )
        }));
      } else {
        await charItemAPI.delete(charItemId);
        setCharacterData(prevData => ({
          ...prevData,
          inventory: prevData.inventory.filter(item => item._id !== charItemId)
        }));
      }
    } catch (error) {
      console.error('Ошибка удаления предмета:', error);
      throw error;
    }
  };

  const equipItem = async (charItemId) => {
    try {
      const { data } = await characterAPI.equipItem(charItemId);
      setCharacterData(data);
      return { success: true };
    } catch (error) {
      console.error('Ошибка экипировки предмета:', error);
      throw error;
    }
  };

  const canEquipItem = useCallback((charItem) => {
    if (!characterData || !charItem || !charItem.gameItem) return false;
    if (characterData.level < charItem.gameItem.minLevel) return false;
    if (charItem.gameItem.requiredClass.length && !charItem.gameItem.requiredClass.includes(characterData.class)) return false;
    for (const [stat, value] of Object.entries(charItem.gameItem.requiredStats)) {
      if (characterData[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`] < value) return false;
    }
    return true;
  }, [characterData]);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  useEffect(() => {
    if (characterData) {
      healthUpdateInterval.current = setInterval(updateHealth, 1000);
    }
    return () => {
      if (healthUpdateInterval.current) {
        clearInterval(healthUpdateInterval.current);
      }
    };
  }, [characterData, updateHealth]);

  return {
    character: characterData,
    loading,
    error,
    isUpdating,
    isSessionExpired,
    updateCharacter,
    deleteItem,
    equipItem,
    canEquipItem,
    fetchCharacter
  };
};

export default useCharacter;