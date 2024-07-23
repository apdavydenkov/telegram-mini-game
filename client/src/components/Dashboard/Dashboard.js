import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Character from '../Character/Character';
import CharacterStats from '../Character/CharacterStats';
import CreateCharacter from '../Character/CharacterCreate';
import Inventory from '../Inventory/Inventory';
import Skills from '../Skills/Skills';
import useAuth from '../../hooks/useAuth';
import useCharacter from '../../hooks/useCharacter';

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
  <div className="w-full max-w-3xl mx-auto bg-gray-100 p-2 rounded-lg shadow-md">
    {children}
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('characterstats');
  const [equipError, setEquipError] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const {
    character,
    loading: characterLoading,
    error,
    isUpdating,
    updateCharacter,
    equipItem,
    fetchCharacter,
    removeItem
  } = useCharacter();

  if (authLoading || characterLoading) {
    return <div className="text-center p-4">Загрузка...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleCharacterUpdate = async (updatedCharacter) => {
    await updateCharacter(updatedCharacter);
  };

  const canEquipItem = (item) => {
    if (!item || !item.gameItem) return false;
    if (character.level < item.gameItem.minLevel) return false;
    if (item.gameItem.requiredClass.length && !item.gameItem.requiredClass.includes(character.class)) return false;
    for (const [stat, value] of Object.entries(item.gameItem.requiredStats)) {
      if (character[`base${stat.charAt(0).toUpperCase() + stat.slice(1)}`] < value) return false;
    }
    return true;
  };

  const handleEquipItem = async (itemId) => {
    const item = character.inventory.find(i => i._id === itemId);
    if (item.isEquipped || canEquipItem(item)) {
      const result = await equipItem(itemId);
      setEquipError(result.success ? '' : result.message);
    } else {
      setEquipError('Не выполнены минимальные требования для надевания этого предмета.');
    }
  };

  const handleUnequipItem = async (itemId) => {
    await equipItem(itemId); // Используем ту же функцию, что и для экипировки
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await removeItem(itemId);  // Используйте функцию removeItem из хука
      setEquipError('');
    } catch (error) {
      console.error('Ошибка удаления предмета:', error);
      setEquipError('Ошибка удаления предмета. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleCharacterCreated = () => {
    fetchCharacter();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    if (!character) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Создание персонажа</h2>
          <CreateCharacter onCharacterCreated={handleCharacterCreated} />
        </div>
      );
    }

    return (
      <>
        <Character
          character={character}
          onUnequipItem={handleUnequipItem}
          onDeleteItem={handleDeleteItem}
        />
        <div className="w-full max-w-3xl mx-auto bg-gray-100 p-2 rounded-lg shadow-md">
          <Tab label="Характеристики" active={activeTab === 'characterstats'} onClick={() => setActiveTab('characterstats')} />
          <Tab label="Инвентарь" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <Tab label="Навыки" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
        </div>
        <TabContent>
          {activeTab === 'characterstats' && (
            <CharacterStats
              character={character}
              onCharacterUpdate={handleCharacterUpdate}
              isUpdating={isUpdating}
              error={error}
            />
          )}
          {activeTab === 'inventory' && (
            <Inventory
              inventory={character.inventory || []}
              onClickInventoryItem={handleEquipItem}
              equipError={equipError}
              canEquipItem={canEquipItem}
              character={character}
            />
          )}
          {activeTab === 'skills' && <Skills skills={character.skills || []} />}
        </TabContent>
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Добро пожаловать, {user.username}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
        >
          Выйти
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default Dashboard;