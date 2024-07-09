import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const CharacterInfoContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
`;

const StatButton = styled.button`
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;

  &:disabled {
    background-color: #cccccc;
  }
`;

const CharacterInfo = ({ character, onCharacterUpdate }) => {
  const [localCharacter, setLocalCharacter] = useState(character);

  const handleStatChange = async (stat, value) => {
    if (localCharacter.availablePoints > 0 || value < 0) {
      const updatedCharacter = {
        ...localCharacter,
        [stat]: localCharacter[stat] + value,
        availablePoints: localCharacter.availablePoints - value
      };

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:5000/api/character',
          updatedCharacter,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLocalCharacter(response.data);
        onCharacterUpdate(response.data);
      } catch (error) {
        console.error('Error updating character:', error);
      }
    }
  };

  return (
    <CharacterInfoContainer>
      <h2>{localCharacter.name}</h2>
      <Stat>
        <span>Class:</span>
        <span>{localCharacter.class}</span>
      </Stat>
      <Stat>
        <span>Level:</span>
        <span>{localCharacter.level}</span>
      </Stat>
      <Stat>
        <span>Experience:</span>
        <span>{localCharacter.experience}</span>
      </Stat>
      <Stat>
        <span>Health:</span>
        <span>{localCharacter.health}</span>
      </Stat>
      <Stat>
        <span>Strength:</span>
        <span>{localCharacter.strength}</span>
        <StatButton onClick={() => handleStatChange('strength', 1)} disabled={localCharacter.availablePoints <= 0}>+</StatButton>
      </Stat>
      <Stat>
        <span>Dexterity:</span>
        <span>{localCharacter.dexterity}</span>
        <StatButton onClick={() => handleStatChange('dexterity', 1)} disabled={localCharacter.availablePoints <= 0}>+</StatButton>
      </Stat>
      <Stat>
        <span>Intelligence:</span>
        <span>{localCharacter.intelligence}</span>
        <StatButton onClick={() => handleStatChange('intelligence', 1)} disabled={localCharacter.availablePoints <= 0}>+</StatButton>
      </Stat>
      <Stat>
        <span>Available Points:</span>
        <span>{localCharacter.availablePoints}</span>
      </Stat>
    </CharacterInfoContainer>
  );
};

export default CharacterInfo;