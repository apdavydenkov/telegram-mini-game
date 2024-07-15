import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Character from '../Character/Character';
import CharacterStats from '../Character/CharacterStats';
import CreateCharacter from '../Character/CharacterCreate';
import Inventory from '../Inventory/Inventory';
import Skills from '../Skills/Skills';

const Tab = ({ label, active, onClick }) => (
  <button
    className={`px-4 py-2 font-bold transition-colors duration-200 
      ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
      first:rounded-tl-lg last:rounded-tr-lg`}
    onClick={onClick}
  >
    {label}
  </button>
);

const TabContent = ({ children }) => (
  <div className="bg-gray-100 rounded-b-lg rounded-tr-lg p-4">
    {children}
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('charactersats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Получение данных пользователя...');
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Данные пользователя получены:', userResponse.data);
        setUser(userResponse.data);

        if (userResponse.data.hasCharacter) {
          console.log('Получение данных персонажа...');
          const characterResponse = await axios.get('http://localhost:5000/api/character', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Данные персонажа получены:', characterResponse.data);
          setCharacter(characterResponse.data);
        }
      } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    } else {
      console.error('Токен не найден в localStorage');
      setLoading(false);
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
      console.error('Ошибка экипировки предмета:', error);
    }
  };

  const handleCharacterCreated = async (nextVersionCharacter) => {
    setCharacter(nextVersionCharacter);
    // Обновляем данные пользователя, чтобы отразить создание персонажа
    const updatedUser = { ...user, hasCharacter: true };
    setUser(updatedUser);
    // Здесь можно также отправить запрос на сервер для обновления данных пользователя
  };

  if (loading) {
    return <div className="text-center p-4">Загрузка...</div>;
  }

  if (!user) {
    return <div className="text-center p-4">Необходима авторизация</div>;
  }

  if (!character) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Создание персонажа</h2>
        <CreateCharacter onCharacterCreated={handleCharacterCreated} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-lg">
      <Character character={character} />
      
      <div className="flex mt-4">
        <Tab label="Характеристики" active={activeTab === 'charactersats'} onClick={() => setActiveTab('charactersats')} />
        <Tab label="Инвентарь" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
        <Tab label="Навыки" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
      </div>
      <TabContent>
        {activeTab === 'charactersats' && <CharacterStats character={character} onCharacterUpdate={handleCharacterUpdate} showDetailedStats={true} />}
        {activeTab === 'inventory' && <Inventory inventory={character.inventory || []} onEquipItem={handleEquipItem} />}
        {activeTab === 'skills' && <Skills skills={character.skills || []} />}
      </TabContent>
    </div>
  );
};

export default Dashboard;