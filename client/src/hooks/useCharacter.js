import { useState, useEffect, useCallback, useRef } from 'react';
import { character } from '../services/api';

const useCharacter = () => {
  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const healthUpdateInterval = useRef(null);
  const updateTimeoutRef = useRef(null);

  const calculateMaxHealth = useCallback((char) => {
    if (!char) return 0;
    const baseHealth = 100;
    const enduranceBonus = char.baseEndurance * 5;
    const equipmentBonus = char.inventory
      .filter(item => item.isEquipped && item.gameItem)
      .reduce((sum, item) => {
        return sum + (item.gameItem.stats.endurance || 0) * 5 + (item.gameItem.stats.health || 0);
      }, 0);
    return baseHealth + enduranceBonus + equipmentBonus;
  }, []);

  const updateHealth = useCallback(() => {
    if (!characterData) return;

    const now = new Date();
    const secondsSinceLastUpdate = Math.max(0, (now - new Date(characterData.healthData.lastUpdate)) / 1000);
    const regenAmount = characterData.calculatedStats.healthRegen * secondsSinceLastUpdate;
    const newHealth = Math.min(
      characterData.healthData.currentHealth + regenAmount,
      characterData.healthData.maxHealth
    );

    setCharacterData(prevData => ({
      ...prevData,
      healthData: {
        ...prevData.healthData,
        currentHealth: Math.round(newHealth * 100) / 100,
        lastUpdate: now.toISOString()
      }
    }));
  }, [characterData]);

  const fetchCharacter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await character.get();
      const maxHealth = calculateMaxHealth(data);
      setCharacterData({
        ...data,
        healthData: {
          currentHealth: data.healthData.currentHealth,
          maxHealth: maxHealth,
          lastUpdate: new Date().toISOString()
        },
        calculatedStats: {
          ...data.calculatedStats,
          healthRegen: maxHealth / data.fullRegenTimeInSeconds
        }
      });
    } catch (err) {
      console.error('Error fetching character:', err);
      setError('Failed to load character data');
    } finally {
      setLoading(false);
    }
  }, [calculateMaxHealth]);

  const updateCharacter = useCallback(async (updatedData) => {
    if (isUpdating) {
      setError('Please wait, character is being updated...');
      return;
    }

    setIsUpdating(true);
    setError(null);

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await character.update(updatedData);
        const maxHealth = calculateMaxHealth(data);
        setCharacterData({
          ...data,
          healthData: {
            currentHealth: data.healthData.currentHealth,
            maxHealth: maxHealth,
            lastUpdate: new Date().toISOString()
          },
          calculatedStats: {
            ...data.calculatedStats,
            healthRegen: maxHealth / data.fullRegenTimeInSeconds
          }
        });
      } catch (err) {
        console.error('Error updating character:', err);
        if (err.response && err.response.status === 409) {
          await fetchCharacter();
          setError('Data conflict occurred. The latest data has been loaded.');
        } else {
          setError('Failed to update character data. Please try again.');
        }
      } finally {
        setIsUpdating(false);
      }
    }, 500);
  }, [calculateMaxHealth, fetchCharacter, isUpdating]);

  const equipItem = useCallback(async (charItemId) => {
    try {
      setError(null);
      const { data } = await character.equipItem(charItemId);
      const maxHealth = calculateMaxHealth(data);
      setCharacterData({
        ...data,
        healthData: {
          currentHealth: data.healthData.currentHealth,
          maxHealth: maxHealth,
          lastUpdate: new Date().toISOString()
        },
        calculatedStats: {
          ...data.calculatedStats,
          healthRegen: maxHealth / data.fullRegenTimeInSeconds
        }
      });
    } catch (err) {
      console.error('Error equipping item:', err);
      setError('Failed to equip item');
    }
  }, [calculateMaxHealth]);

  useEffect(() => {
    fetchCharacter();
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
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
    fetchCharacter
  };
};

export default useCharacter;