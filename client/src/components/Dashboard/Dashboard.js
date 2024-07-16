import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Character from '../Character/Character';
import CharacterStats from '../Character/CharacterStats';
import CreateCharacter from '../Character/CharacterCreate';
import Inventory from '../Inventory/Inventory';
import Skills from '../Skills/Skills';
import { APP_SERVER_URL } from '../../config/config';

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
  const [activeTab, setActiveTab] = useState('characterstats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    const intervalId = setInterval(fetchUserData, 5000); // Обновление каждые 5 секунд

    return () => clearInterval(intervalId);
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setError(null);
        const userResponse = await axios.get(`${APP_SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        if (userResponse.data.hasCharacter) {
          const characterResponse = await axios.get(`${APP_SERVER_URL}/api/character`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCharacter(characterResponse.data);
        }
      } catch (error) {
        console.error('Ошибка получения данных:', error.response?.data || error.message);
        setError('Ошибка получения данных. Пожалуйста, попробуйте позже.');
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError('Необходима авторизация');
      setLoading(false);
      navigate('/login');
    }
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    setCharacter(updatedCharacter);
  };

  const handleEquipItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${APP_SERVER_URL}/api/character/equip`,
        { charItemId: itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCharacter(response.data);
    } catch (error) {
      console.error('Ошибка экипировки предмета:', error);
      setError('Ошибка экипировки предмета. Пожалуйста, попробуйте снова.');
    }
  };

  const handleCharacterCreated = (newCharacter) => {
    setCharacter(newCharacter);
    setUser(prevUser => ({ ...prevUser, hasCharacter: true }));
  };

  if (loading) {
    return <div className="text-center p-4">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-4">Необходима авторизация</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-lg">
      {character ? (
        <>
          <Character character={character} />

          <div className="flex mt-4">
            <Tab label="Характеристики" active={activeTab === 'characterstats'} onClick={() => setActiveTab('characterstats')} />
            <Tab label="Инвентарь" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <Tab label="Навыки" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
          </div>
          <TabContent>
            {activeTab === 'characterstats' && <CharacterStats character={character} onCharacterUpdate={handleCharacterUpdate} />}
            {activeTab === 'inventory' && <Inventory inventory={character.inventory || []} onClickInventoryItem={handleEquipItem} />}
            {activeTab === 'skills' && <Skills skills={character.skills || []} />}
          </TabContent>
        </>
      ) : (
        <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Создание персонажа</h2>
          <CreateCharacter onCharacterCreated={handleCharacterCreated} />
        </div>
      )}
    </div>
  );
};

export default Dashboard; 