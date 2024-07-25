import { useState, useEffect, useCallback, useRef } from 'react';
import { character } from '../services/api';

const useCharacter = () => {
  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const healthUpdateInterval = useRef(null);

  const fetchCharacter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await character.get();
      if (data) {
        setCharacterData(data);
      } else {
        setCharacterData(null);
      }
    } catch (err) {
      console.error('Error fetching character:', err);
      setError('Failed to load character data');
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
      const { data } = await character.update(updatedData);
      setCharacterData(data);
    } catch (err) {
      console.error('Error updating character:', err);
      setError('Failed to update character data. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating]);

  const equipItem = useCallback(async (charItemId) => {
    try {
      setError(null);
      const { data } = await character.equipItem(charItemId);
      setCharacterData(data);
      return { success: true };
    } catch (err) {
      console.error('Error equipping item:', err);
      setError('Failed to equip item');
      return { success: false, message: 'Failed to equip item' };
    }
  }, []);

  const removeItem = useCallback(async (itemId, quantity) => {
    try {
      console.log('Удаление предмета:', itemId, 'Количество:', quantity);
      const { data } = await character.removeItem(itemId, quantity);
      console.log('Ответ сервера после удаления:', data);
      setCharacterData(prevData => {
        const updatedInventory = prevData.inventory.map(item => {
          if (item._id === itemId) {
            const newQuantity = item.quantity - quantity;
            if (newQuantity <= 0) {
              return null;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        }).filter(Boolean);
        console.log('Обновленный инвентарь в хуке:', updatedInventory);
        return { ...prevData, inventory: updatedInventory };
      });
    } catch (error) {
      console.error('Ошибка удаления предмета:', error);
      throw error;
    }
  }, []);

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
    updateCharacter,
    equipItem,
    removeItem,
    fetchCharacter
  };
};

export default useCharacter;