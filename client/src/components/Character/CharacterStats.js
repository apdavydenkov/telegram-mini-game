import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDumbbell, FaRunning, FaBrain, FaHeart, FaSmile, FaFistRaised, FaShieldAlt, FaBullseye, FaWind, FaHeartbeat, FaStar, FaBolt, FaPercent, FaBalanceScale } from 'react-icons/fa';

const CharacterInfo = ({ character, onCharacterUpdate, showDetailedStats }) => {
  const [updatedCharacter, setUpdatedCharacter] = useState(character);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUpdatedCharacter(character);
  }, [character]);

  const handleStatIncrease = async (stat) => {
    if (updatedCharacter.finalDistribution) return;

    const token = localStorage.getItem('token');

    if (updatedCharacter.availablePoints > 0) {
      const newCharacter = {
        ...updatedCharacter,
        [stat]: updatedCharacter[stat] + 1,
        availablePoints: updatedCharacter.availablePoints - 1
      };

      try {
        const response = await axios.put('http://localhost:5000/api/character',
          { ...newCharacter, version: updatedCharacter.version },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUpdatedCharacter(response.data);
        onCharacterUpdate(response.data);
        setError(null);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Конфликт версий, получаем актуальные данные и пробуем снова
          try {
            const refreshResponse = await axios.get('http://localhost:5000/api/character', {
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

  const StatItem = ({ icon: Icon, label, value, stat, isAdjustable = true }) => (
    <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm mb-2">
      <span className="flex items-center text-gray-700">
        <Icon className="mr-2 text-blue-500" />
        {label}:
      </span>
      <div className="flex items-center">
        <span className="font-semibold text-blue-600 mx-2">{value}</span>
        {isAdjustable && !updatedCharacter.finalDistribution && (
          <button
            onClick={() => handleStatIncrease(stat)}
            disabled={updatedCharacter.availablePoints <= 0}
            className="w-6 h-6 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            +
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Базовые параметры</h3>
        <StatItem icon={FaDumbbell} label="Сила" value={updatedCharacter.strength} stat="strength" />
        <StatItem icon={FaRunning} label="Ловкость" value={updatedCharacter.dexterity} stat="dexterity" />
        <StatItem icon={FaBrain} label="Интеллект" value={updatedCharacter.intelligence} stat="intelligence" />
        <StatItem icon={FaHeart} label="Выносливость" value={updatedCharacter.endurance} stat="endurance" />
        <StatItem icon={FaSmile} label="Харизма" value={updatedCharacter.charisma} stat="charisma" />
        <StatItem icon={FaHeart} label="Здоровье" value={updatedCharacter.health} isAdjustable={false} />
        {updatedCharacter.availablePoints > 0 && !updatedCharacter.finalDistribution && (
          <div className="bg-yellow-300 flex items-center p-2 bg-white rounded-lg shadow-sm mb-2 font-semibold text-red-600 animate-pulse">
            <FaStar className="mr-2 text-yellow-500" />
            Доступные навыки: {updatedCharacter.availablePoints}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Боевые характеристики</h3>
        <StatItem icon={FaFistRaised} label="Урон" value={updatedCharacter.damage} isAdjustable={false} />
        <StatItem icon={FaShieldAlt} label="Броня" value={updatedCharacter.armor} isAdjustable={false} />
        <StatItem icon={FaBullseye} label="Шанс крита" value={`${updatedCharacter.criticalChance.toFixed(2)}%`} isAdjustable={false} />
        <StatItem icon={FaBolt} label="Сила крита" value={`${updatedCharacter.criticalDamage.toFixed(2)}%`} isAdjustable={false} />
        <StatItem icon={FaWind} label="Уворот" value={`${updatedCharacter.dodge.toFixed(2)}%`} isAdjustable={false} />
        <StatItem icon={FaBalanceScale} label="Контрудар" value={`${updatedCharacter.counterAttack.toFixed(2)}%`} isAdjustable={false} />
        <StatItem icon={FaHeartbeat} label="Реген здоровья" value={`${updatedCharacter.healthRegen.toFixed(2)}/сек`} isAdjustable={false} />
      </div>
    </div>
  );
};

export default CharacterInfo;