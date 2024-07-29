import React, { useState, useEffect } from 'react';
import Character from '../Character/Character';
import CharacterStats from '../Character/CharacterStats';
import CreateCharacter from '../Character/CharacterCreate';
import Inventory from '../Inventory/Inventory';
import Skills from '../Skills/Skills';
import useCharacter from '../../hooks/useCharacter';
import useAuth from '../../hooks/useAuth';
import Header from '../Interface/Header';
import CharItemInfo from '../Inventory/CharItemInfo';
import InfoModal from '../Interface/InfoModal';
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
  const { user, loading: authLoading, error: authError } = useAuth();
  const { character, loading: charLoading, error: charError, deleteItem, equipItem, updateCharacter, fetchCharacter, canEquipItem } = useCharacter();
  const [activeTab, setActiveTab] = useState('characterstats');
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  useEffect(() => {
    if (authError) {
      setInfoMessage(`Ошибка аутентификации: ${authError}`);
    } else if (charError) {
      setInfoMessage(`Ошибка: ${charError}`);
    }
  }, [authError, charError]);

  const handleDeleteItem = async (charItemId, deleteQuantity) => {
    try {
      await deleteItem(charItemId, deleteQuantity);
    } catch (error) {
      setInfoMessage(error.message);
    }
  };

  const handleEquipItem = async (charItemId) => {
    try {
      await equipItem(charItemId);
    } catch (error) {
      setInfoMessage('Ошибка экипировки предмета');
    }
  };

  const handleShowItemInfo = (item) => {
    setSelectedItem(item);
  };

  const handleCharacterUpdate = async (updatedCharacter) => {
    try {
      await updateCharacter(updatedCharacter);
    } catch (error) {
      console.error('Ошибка обновления персонажа:', error);
      setInfoMessage('Не удалось обновить персонажа. Попробуйте еще раз.');
    }
  };

  const handleCloseInfoModal = () => {
    setInfoMessage(null);
    fetchCharacter(); // Обновляем данные персонажа после закрытия модального окна
  };

  if (authLoading || charLoading) return <div>Загрузка...</div>;
  if (!user) return null; // Пользователь будет перенаправлен в useAuth
  if (!character) return <CreateCharacter onCharacterCreated={fetchCharacter} />;

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-lg">
      <Header />
      <Character
        character={character}
        onEquipItem={handleEquipItem}
        onShowItemInfo={handleShowItemInfo}
      />
      <div className="w-full max-w-3xl mx-auto bg-gray-100 p-2 rounded-lg shadow-md">
        <Tab label="Характеристики" active={activeTab === 'characterstats'} onClick={() => setActiveTab('characterstats')} />
        <Tab label="Инвентарь" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
        <Tab label="Навыки" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
      </div>
      <TabContent>
        {activeTab === 'characterstats' && <CharacterStats character={character} onCharacterUpdate={handleCharacterUpdate} />}
        {activeTab === 'inventory' && (
          <Inventory
            inventory={character.inventory}
            onEquipItem={handleEquipItem}
            onShowItemInfo={handleShowItemInfo}
            canEquipItem={canEquipItem}
          />
        )}
        {activeTab === 'skills' && <Skills skills={character.skills || []} />}
      </TabContent>
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CharItemInfo
            charItem={selectedItem}
            onClose={() => setSelectedItem(null)}
            onDeleteItem={handleDeleteItem}
            onEquipItem={handleEquipItem}
            canEquipItem={canEquipItem}
            character={character}
          />
        </div>
      )}
      {infoMessage && <InfoModal message={infoMessage} onClose={handleCloseInfoModal} />}
    </div>
  );
};

export default Dashboard;