import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDumbbell, FaRunning, FaBrain, FaHeart, FaSmile, FaFistRaised, FaShieldAlt, FaBullseye, FaWind, FaHeartbeat, FaStar, FaBolt, FaBalanceScale } from 'react-icons/fa';
import { APP_SERVER_URL } from '../../config/config';

const CharacterStats = ({ character, onCharacterUpdate }) => {
  const [updatedCharacter, setUpdatedCharacter] = useState(character);
  const [currentHealth, setCurrentHealth] = useState(character?.healthData?.currentHealth || 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUpdatedCharacter(character);
    if (character && character.healthData) {
      setCurrentHealth(character.healthData.currentHealth);

      const updateHealth = () => {
        const now = new Date();
        const secondsSinceLastUpdate = Math.max(0, (now - new Date(character.healthData.lastUpdate)) / 1000);
        const regenAmount = character.healthData.regenRate * secondsSinceLastUpdate;
        const newHealth = Math.min(character.healthData.currentHealth, character.healthData.maxHealth);
        setCurrentHealth(Math.round(newHealth * 100) / 100);
      };

      updateHealth();
      const intervalId = setInterval(updateHealth, 1000);

      return () => clearInterval(intervalId);
    }
  }, [character]);

  const calculateTotalStat = (baseStat, statName) => {
    if (!updatedCharacter || !updatedCharacter.inventory) return baseStat;

    const equippedItems = updatedCharacter.inventory.filter(item => item.isEquipped);
    const bonusStat = equippedItems.reduce((sum, item) => sum + (item.gameItem?.stats?.[statName] || 0), 0);
    return baseStat + bonusStat;
  };

  const handleStatIncrease = async (stat) => {
    if (updatedCharacter.finalDistribution) return;

    const token = localStorage.getItem('token');

    if (updatedCharacter.availablePoints > 0) {
      const nextVersionCharacter = {
        ...updatedCharacter,
        [`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`]: updatedCharacter[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`] + 1,
        availablePoints: updatedCharacter.availablePoints - 1
      };

      try {
        const response = await axios.put(`${APP_SERVER_URL}/api/character`,
          { ...nextVersionCharacter, version: updatedCharacter.version },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUpdatedCharacter(response.data);
        onCharacterUpdate(response.data);
        setError(null);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          try {
            const refreshResponse = await axios.get(`${APP_SERVER_URL}/api/character`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUpdatedCharacter(refreshResponse.data);
            onCharacterUpdate(refreshResponse.data);
            setError('Данные были обновлены. Пожалуйста, попробуйте снова.');
          } catch (refreshError) {
            console.error('Ошибка обновления данных:', refreshError);
            setError('Не удалось обновить данные. Пожалуйста, обновите страницу.');
          }
        } else {
          console.error('Ошибка обновления характеристик:', error);
          setError('Не удалось обновить характеристики. Попробуйте еще раз.');
        }
      }
    }
  };

  const StatParam = ({ icon: Icon, label, value, maxValue, stat, isAdjustable = true }) => {
    if (!stat && value === undefined) return null;

    const baseValue = updatedCharacter[`base${stat?.charAt(0).toUpperCase() + stat?.slice(1)}`] || 0;
    const totalValue = stat ? calculateTotalStat(baseValue, stat.toLowerCase()) : value;
    const bonusValue = stat ? totalValue - baseValue : 0;

    const formatValue = (val) => {
      if (typeof val === 'number') {
        // Округляем до целого числа для базовых параметров и здоровья
        if (['strength', 'dexterity', 'intelligence', 'endurance', 'charisma'].includes(stat) || label === 'Здоровье') {
          return Math.round(val);
        }
        // Для остальных параметров оставляем два знака после запятой
        return val.toFixed(2);
      }
      return val;
    };

    return (
      <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm mb-2">
        <span className="flex items-center text-gray-700">
          <Icon className="mr-2 text-blue-500" />
          {label}:
        </span>
        <div className="flex items-center">
          <span className="font-semibold text-blue-600 mx-2">
            {maxValue !== undefined ? `${formatValue(totalValue)}/${formatValue(maxValue)}` : formatValue(totalValue)}
            {bonusValue > 0 && <span className="text-green-500 ml-1">(+{formatValue(bonusValue)})</span>}
          </span>
          {isAdjustable && !updatedCharacter.finalDistribution && updatedCharacter.availablePoints > 0 && (
            <button
              onClick={() => handleStatIncrease(stat)}
              className="w-6 h-6 bg-green-500 text-white rounded"
            >
              +
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!updatedCharacter || !updatedCharacter.calculatedStats) {
    return <div>Загрузка характеристик...</div>;
  }

  const { calculatedStats } = updatedCharacter;

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Базовые параметры</h3>
        <StatParam icon={FaDumbbell} label="Сила" value={calculateTotalStat(updatedCharacter.baseStrength, 'strength')} stat="strength" />
        <StatParam icon={FaRunning} label="Ловкость" value={calculateTotalStat(updatedCharacter.baseDexterity, 'dexterity')} stat="dexterity" />
        <StatParam icon={FaBrain} label="Интеллект" value={calculateTotalStat(updatedCharacter.baseIntelligence, 'intelligence')} stat="intelligence" />
        <StatParam icon={FaHeart} label="Выносливость" value={calculateTotalStat(updatedCharacter.baseEndurance, 'endurance')} stat="endurance" />
        <StatParam icon={FaSmile} label="Харизма" value={calculateTotalStat(updatedCharacter.baseCharisma, 'charisma')} stat="charisma" />
        <StatParam
          icon={FaHeart}
          label="Здоровье"
          value={currentHealth}
          maxValue={updatedCharacter.healthData.maxHealth}
          isAdjustable={false}
        />
        {updatedCharacter.availablePoints > 0 && !updatedCharacter.finalDistribution && (
          <div className="bg-yellow-300 flex items-center p-2 bg-white rounded-lg shadow-sm mb-2 font-semibold text-red-600 animate-pulse">
            <FaStar className="mr-2 text-yellow-500" />
            Доступные навыки: {updatedCharacter.availablePoints}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Боевые характеристики</h3>
        <StatParam icon={FaFistRaised} label="Урон" value={calculatedStats.damage} isAdjustable={false} />
        <StatParam icon={FaShieldAlt} label="Броня" value={calculatedStats.armor} isAdjustable={false} />
        <StatParam icon={FaBullseye} label="Шанс крита" value={`${calculatedStats.criticalChance.toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaBolt} label="Сила крита" value={`${calculatedStats.criticalDamage.toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaWind} label="Уворот" value={`${calculatedStats.dodge.toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaBalanceScale} label="Контрудар" value={`${calculatedStats.counterAttack.toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaHeartbeat} label="Реген здоровья" value={`${calculatedStats.healthRegen.toFixed(2)}/сек`} isAdjustable={false} />
      </div>
    </div>
  );
};

export default CharacterStats;