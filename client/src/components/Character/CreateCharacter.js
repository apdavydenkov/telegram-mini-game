import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const CreateCharacterContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 3px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 3px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const StatContainer = styled.div`
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

  &:disabled {
    background-color: #cccccc;
  }
`;

const CreateCharacter = ({ onCharacterCreated }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('Warrior');
  const [strength, setStrength] = useState(10);
  const [dexterity, setDexterity] = useState(10);
  const [intelligence, setIntelligence] = useState(10);
  const [availablePoints, setAvailablePoints] = useState(5);

  const handleStatChange = (stat, value) => {
    if (availablePoints > 0 || value < 0) {
      switch(stat) {
        case 'strength':
          setStrength(prev => Math.max(10, prev + value));
          break;
        case 'dexterity':
          setDexterity(prev => Math.max(10, prev + value));
          break;
        case 'intelligence':
          setIntelligence(prev => Math.max(10, prev + value));
          break;
        default:
          break;
      }
      setAvailablePoints(prev => prev - value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/character', 
        { name, class: characterClass, strength, dexterity, intelligence },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCharacterCreated(response.data);
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  return (
    <CreateCharacterContainer>
      <h2>Create Character</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Character Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          value={characterClass}
          onChange={(e) => setCharacterClass(e.target.value)}
        >
          <option value="Warrior">Warrior</option>
          <option value="Mage">Mage</option>
          <option value="Archer">Archer</option>
        </Select>
        <p>Available points: {availablePoints}</p>
        <StatContainer>
          <span>Strength: {strength}</span>
          <div>
            <StatButton type="button" onClick={() => handleStatChange('strength', -1)} disabled={strength <= 10}>-</StatButton>
            <StatButton type="button" onClick={() => handleStatChange('strength', 1)} disabled={availablePoints <= 0}>+</StatButton>
          </div>
        </StatContainer>
        <StatContainer>
          <span>Dexterity: {dexterity}</span>
          <div>
            <StatButton type="button" onClick={() => handleStatChange('dexterity', -1)} disabled={dexterity <= 10}>-</StatButton>
            <StatButton type="button" onClick={() => handleStatChange('dexterity', 1)} disabled={availablePoints <= 0}>+</StatButton>
          </div>
        </StatContainer>
        <StatContainer>
          <span>Intelligence: {intelligence}</span>
          <div>
            <StatButton type="button" onClick={() => handleStatChange('intelligence', -1)} disabled={intelligence <= 10}>-</StatButton>
            <StatButton type="button" onClick={() => handleStatChange('intelligence', 1)} disabled={availablePoints <= 0}>+</StatButton>
          </div>
        </StatContainer>
        <Button type="submit">Create Character</Button>
      </form>
    </CreateCharacterContainer>
  );
};

export default CreateCharacter;