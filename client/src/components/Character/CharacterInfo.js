import React from 'react';
import styled from 'styled-components';

const CharacterInfoContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const CharacterInfo = ({ character }) => {
  return (
    <CharacterInfoContainer>
      <h2>{character.name}</h2>
      <p>Class: {character.class}</p>
      <p>Level: {character.level}</p>
      <p>Experience: {character.experience}</p>
      <p>Health: {character.health}</p>
      <p>Strength: {character.strength}</p>
      <p>Dexterity: {character.dexterity}</p>
      <p>Intelligence: {character.intelligence}</p>
    </CharacterInfoContainer>
  );
};

export default CharacterInfo;