import React from 'react';
import styled from 'styled-components';
import { FaDumbbell, FaRunning, FaBrain, FaFistRaised, FaShieldAlt, FaBullseye, FaWind, FaHeartbeat } from 'react-icons/fa';

const CharacterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background-color: #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
`;

const StatColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.h3`
  margin-bottom: 10px;
  text-align: center;
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 5px;
`;

const StatIcon = styled.span`
  margin-right: 5px;
`;

const CharacterInfo = ({ character, onCharacterUpdate, showDetailedStats }) => {
  const calculateDamage = () => character.strength * 10;
  const calculateArmor = () => character.strength * 5;
  const calculateCrit = () => (character.strength * 3) + (character.dexterity * 3);
  const calculateDodge = () => (character.dexterity * 3) + (character.intelligence * 3);
  const calculateHealthRegen = () => 1 + (character.intelligence * 0.05);

  return (
    <CharacterContainer>
      {showDetailedStats && (
        <StatsContainer>
          <StatColumn>
            <StatTitle>Базовые параметры</StatTitle>
            <Stat>
              <span><StatIcon><FaDumbbell /></StatIcon> Сила:</span>
              <span>{character.strength}</span>
            </Stat>
            <Stat>
              <span><StatIcon><FaRunning /></StatIcon> Ловкость:</span>
              <span>{character.dexterity}</span>
            </Stat>
            <Stat>
              <span><StatIcon><FaBrain /></StatIcon> Интеллект:</span>
              <span>{character.intelligence}</span>
            </Stat>
          </StatColumn>
          <StatColumn>
            <StatTitle>Боевые характеристики</StatTitle>
            <Stat>
              <span><StatIcon><FaFistRaised /></StatIcon> Урон:</span>
              <span>{calculateDamage()}</span>
            </Stat>
            <Stat>
              <span><StatIcon><FaShieldAlt /></StatIcon> Броня:</span>
              <span>{calculateArmor()}</span>
            </Stat>
            <Stat>
              <span><StatIcon><FaBullseye /></StatIcon> Крит:</span>
              <span>{calculateCrit()}</span>
            </Stat>
            <Stat>
              <span><StatIcon><FaWind /></StatIcon> Уворот:</span>
              <span>{calculateDodge()}</span>
            </Stat>
            <Stat>
              <span><StatIcon><FaHeartbeat /></StatIcon> Восстановление:</span>
              <span>{calculateHealthRegen().toFixed(2)}/сек</span>
            </Stat>
          </StatColumn>
        </StatsContainer>
      )}
    </CharacterContainer>
  );
};

export default CharacterInfo;