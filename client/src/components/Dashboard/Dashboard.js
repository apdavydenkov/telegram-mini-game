import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import CharacterInfo from '../Character/CharacterStats';
import Inventory from '../Inventory/Inventory';
import Skills from '../Skills/Skills';
import Character from '../Character/Character';

const DashboardContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  border: 2px solid #333;
  border-radius: 10px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.$active ? '#4CAF50' : '#ddd'};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.$active ? '#45a049' : '#ccc'};
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('characteristics');

  useEffect(() => {
    fetchUserData();
  }, []);

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

  const handleCharacterUpdate = (updatedCharacter) => {
    setCharacter(updatedCharacter);
  };

  const handleEquipItem = async (itemId, slot) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/character/equip', 
        { itemId, slot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCharacter(response.data);
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  if (!user || !character) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <Character character={character} />
      
      <TabContainer>
        <Tab $active={activeTab === 'characteristics'} onClick={() => setActiveTab('characteristics')}>Характеристики</Tab>
        <Tab $active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>Инвентарь</Tab>
        <Tab $active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>Навыки</Tab>
      </TabContainer>

      <ContentContainer>
        {activeTab === 'characteristics' && <CharacterInfo character={character} onCharacterUpdate={handleCharacterUpdate} showDetailedStats={true} />}
        {activeTab === 'inventory' && <Inventory inventory={character.inventory || []} onEquipItem={handleEquipItem} />}
        {activeTab === 'skills' && <Skills skills={character.skills || []} />}
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
