import React from 'react';
import { FaDumbbell, FaRunning, FaBrain, FaHeart, FaSmile, FaFistRaised, FaShieldAlt, FaBullseye, FaWind, FaHeartbeat, FaStar, FaBolt, FaBalanceScale } from 'react-icons/fa';

const CharacterStats = ({ character, onCharacterUpdate, isUpdating, error }) => {
  const calculateTotalStat = (baseStat, statName) => {
    if (!character || !character.inventory) return baseStat;

    const equippedItems = character.inventory.filter(item => item.isEquipped);
    const bonusStat = equippedItems.reduce((sum, item) => sum + (item.gameItem?.stats?.[statName] || 0), 0);
    return baseStat + bonusStat;
  };

  const handleStatIncrease = async (stat) => {
    if (character.zeroPoints || isUpdating) return;

    const updatedCharacter = {
      ...character,
      [`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`]: character[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`] + 1,
      availablePoints: character.availablePoints - 1,
      version: character.version
    };

    await onCharacterUpdate(updatedCharacter);
  };

  const StatParam = ({ icon: Icon, label, value, maxValue, stat, isAdjustable = true }) => {
    if (!stat && value === undefined) return null;

    const baseValue = character[`base${stat?.charAt(0).toUpperCase() + stat?.slice(1)}`] || 0;
    const totalValue = stat ? calculateTotalStat(baseValue, stat.toLowerCase()) : value;
    const bonusValue = stat ? totalValue - baseValue : 0;

    const formatValue = (val) => {
      if (typeof val === 'number') {
        if (['strength', 'dexterity', 'intelligence', 'endurance', 'charisma'].includes(stat)) {
          return Math.round(val);
        }
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
          {isAdjustable && !character.zeroPoints && character.availablePoints > 0 && (
            <button
              onClick={() => handleStatIncrease(stat)}
              className={`w-6 h-6 ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white rounded transition-colors duration-200`}
              disabled={isUpdating}
            >
              +
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!character || !character.calculatedStats) {
    return <div>Загрузка характеристик...</div>;
  }

  const { calculatedStats } = character;

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="col-span-2 text-red-500 mb-4">{error}</div>}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">Базовые параметры</h3>
        <StatParam icon={FaDumbbell} label="Сила" value={calculateTotalStat(character.baseStrength, 'strength')} stat="strength" />
        <StatParam icon={FaRunning} label="Ловкость" value={calculateTotalStat(character.baseDexterity, 'dexterity')} stat="dexterity" />
        <StatParam icon={FaBrain} label="Интеллект" value={calculateTotalStat(character.baseIntelligence, 'intelligence')} stat="intelligence" />
        <StatParam icon={FaHeart} label="Выносливость" value={calculateTotalStat(character.baseEndurance, 'endurance')} stat="endurance" />
        <StatParam icon={FaSmile} label="Харизма" value={calculateTotalStat(character.baseCharisma, 'charisma')} stat="charisma" />
        {character.availablePoints > 0 && !character.zeroPoints && (
          <div className="bg-yellow-300 flex items-center p-2 bg-white rounded-lg shadow-sm mb-2 font-semibold text-red-600 animate-pulse">
            <FaStar className="mr-2 text-yellow-500" />
            Доступные навыки: {character.availablePoints}
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