import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const CreateCharacterContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
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

const CreateCharacter = ({ onCharacterCreated }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('Warrior');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/character', 
        { name, class: characterClass },
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
        <Button type="submit">Create Character</Button>
      </form>
    </CreateCharacterContainer>
  );
};

export default CreateCharacter;