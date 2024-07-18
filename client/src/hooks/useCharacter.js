import { useState, useEffect, useCallback } from 'react';
import { characterAPI } from '../services/api';

export const useCharacter = () => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCharacter = useCallback(async () => {
    try {
      console.log('useCharacter: Fetching character data');
      setLoading(true);
      const response = await characterAPI.getCharacter();
      setCharacter(response.data);
      setError(null);
    } catch (err) {
      console.error('useCharacter: Error fetching character data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  const createCharacter = async (characterData) => {
    try {
      console.log('useCharacter: Creating character');
      setLoading(true);
      const response = await characterAPI.createCharacter(characterData);
      setCharacter(response.data);
    } catch (err) {
      console.error('useCharacter: Error creating character', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCharacter = async (characterData) => {
    try {
      console.log('useCharacter: Updating character');
      setLoading(true);
      const response = await characterAPI.updateCharacter(characterData, character.version);
      setCharacter(response.data);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.error('useCharacter: Version conflict, fetching latest data');
        await fetchCharacter();
        setError('Данные были обновлены. Пожалуйста, повторите ваше действие.');
      } else {
        console.error('useCharacter: Error updating character', err);
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const equipItem = async (itemId) => {
    try {
      console.log('useCharacter: Equipping item');
      setLoading(true);
      const response = await characterAPI.equipItem(itemId, character.version);
      setCharacter(response.data);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.error('useCharacter: Version conflict, fetching latest data');
        await fetchCharacter();
        setError('Данные были обновлены. Пожалуйста, повторите ваше действие.');
      } else {
        console.error('useCharacter: Error equipping item', err);
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addItemToInventory = async (itemData) => {
    try {
      console.log('useCharacter: Adding item to inventory');
      setLoading(true);
      const response = await characterAPI.addItemToInventory(itemData, character.version);
      setCharacter(response.data);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.error('useCharacter: Version conflict, fetching latest data');
        await fetchCharacter();
        setError('Данные были обновлены. Пожалуйста, повторите ваше действие.');
      } else {
        console.error('useCharacter: Error adding item to inventory', err);
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getHealthData = async () => {
    try {
      console.log('useCharacter: Getting health data');
      const response = await characterAPI.getHealthData();
      return response.data;
    } catch (err) {
      console.error('useCharacter: Error getting health data', err);
      setError(err.message);
      throw err;
    }
  };

  const damageCharacter = async (damageData) => {
    try {
      console.log('useCharacter: Damaging character');
      setLoading(true);
      const response = await characterAPI.damageCharacter(damageData, character.version);
      setCharacter(prevChar => ({
        ...prevChar,
        healthData: response.data
      }));
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.error('useCharacter: Version conflict, fetching latest data');
        await fetchCharacter();
        setError('Данные были обновлены. Пожалуйста, повторите ваше действие.');
      } else {
        console.error('useCharacter: Error damaging character', err);
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    character,
    loading,
    error,
    fetchCharacter,
    createCharacter,
    updateCharacter,
    equipItem,
    addItemToInventory,
    getHealthData,
    damageCharacter
  };
};