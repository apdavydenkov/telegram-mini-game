import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import CreateCharacter from '../Character/CreateCharacter';
import CharacterInfo from '../Character/CharacterInfo';

const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userResponse.data);

          const characterResponse = await axios.get('http://localhost:5000/api/character', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCharacter(characterResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleCharacterCreated = (newCharacter) => {
    setCharacter(newCharacter);
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    setCharacter(updatedCharacter);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <h1>Dashboard</h1>
      <p>Welcome, {user.username}!</p>
      <p>Email: {user.email}</p>
      {character ? (
        <CharacterInfo character={character} onCharacterUpdate={handleCharacterUpdate} />
      ) : (
        <CreateCharacter onCharacterCreated={handleCharacterCreated} />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;