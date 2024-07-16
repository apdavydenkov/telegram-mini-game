import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDumbbell, FaRunning, FaBrain, FaHeart, FaSmile, FaFistRaised, FaShieldAlt, FaBullseye, FaWind, FaHeartbeat, FaStar, FaBolt, FaPercent, FaBalanceScale } from 'react-icons/fa';
import { APP_SERVER_URL } from '../../config/config';

const CharacterStats = ({ character, onCharacterUpdate }) => {
  const [updatedCharacter, setUpdatedCharacter] = useState(character);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUpdatedCharacter(character);
  }, [character]);

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

  const StatParam = ({ icon: Icon, label, value, maxValue, stat, isAdjustable = true }) => (
    <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm mb-2">
      <span className="flex items-center text-gray-700">
        <Icon className="mr-2 text-blue-500" />
        {label}:
      </span>
      <div className="flex items-center">
        <span className="font-semibold text-blue-600 mx-2">
          {maxValue !== undefined
            ? `${Math.round(value || 0)}/${Math.round(maxValue || 0)}`
            : Math.round(value || 0)
          }
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

  if (!updatedCharacter || !updatedCharacter.calculatedStats) {
    return <div>Загрузка характеристик...</div>;
  }

  const { calculatedStats } = updatedCharacter;

  console.log('Health:', calculatedStats.health);
  console.log('MaxHealth:', calculatedStats.maxHealth);

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Базовые параметры</h3>
        <StatParam icon={FaDumbbell} label="Сила" value={updatedCharacter.baseStrength} stat="strength" />
        <StatParam icon={FaRunning} label="Ловкость" value={updatedCharacter.baseDexterity} stat="dexterity" />
        <StatParam icon={FaBrain} label="Интеллект" value={updatedCharacter.baseIntelligence} stat="intelligence" />
        <StatParam icon={FaHeart} label="Выносливость" value={updatedCharacter.baseEndurance} stat="endurance" />
        <StatParam icon={FaSmile} label="Харизма" value={updatedCharacter.baseCharisma} stat="charisma" />
        <StatParam
          icon={FaHeart}
          label="Здоровье"
          value={calculatedStats.health}
          maxValue={calculatedStats.maxHealth}
          isAdjustable={false}
        />       {updatedCharacter.availablePoints > 0 && !updatedCharacter.finalDistribution && (
          <div className="bg-yellow-300 flex items-center p-2 bg-white rounded-lg shadow-sm mb-2 font-semibold text-red-600 animate-pulse">
            <FaStar className="mr-2 text-yellow-500" />
            Доступные навыки: {updatedCharacter.availablePoints}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Боевые характеристики</h3>
        <StatParam icon={FaFistRaised} label="Урон" value={calculatedStats.damage || 0} isAdjustable={false} />
        <StatParam icon={FaShieldAlt} label="Броня" value={calculatedStats.armor || 0} isAdjustable={false} />
        <StatParam icon={FaBullseye} label="Шанс крита" value={`${(calculatedStats.criticalChance || 0).toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaBolt} label="Сила крита" value={`${(calculatedStats.criticalDamage || 0).toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaWind} label="Уворот" value={`${(calculatedStats.dodge || 0).toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaBalanceScale} label="Контрудар" value={`${(calculatedStats.counterAttack || 0).toFixed(2)}%`} isAdjustable={false} />
        <StatParam icon={FaHeartbeat} label="Реген здоровья" value={`${calculatedStats.healthRegenRate.toFixed(2)}/сек`} isAdjustable={false} />      </div>
    </div>
  );
};

export default CharacterStats;