import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APP_SERVER_URL } from '../../config/config';

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="flex justify-between items-center mb-2">
    <label className="text-right pr-2 w-1/2">{label}:</label>
    {type === 'checkbox' ? (
      <input
        type="checkbox"
        name={name}
        checked={value}
        onChange={onChange}
        className="w-5 h-5"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-1/2 h-[25px] px-2 border rounded text-right"
      />
    )}
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="flex justify-between items-center mb-2">
    <label className="text-right pr-2 w-1/2">{label}:</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-1/2 h-[25px] px-2 border rounded text-right"
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col mb-2">
    <label className="font-bold mb-1">{label}:</label>
    <div className="flex flex-wrap">
      {options.map(option => (
        <div key={option} className="mr-4">
          <input
            type="checkbox"
            id={`${name}-${option}`}
            name={name}
            value={option}
            checked={value.includes(option)}
            onChange={onChange}
            className="mr-1"
          />
          <label htmlFor={`${name}-${option}`}>{option}</label>
        </div>
      ))}
    </div>
  </div>
);

const AdminGameItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gameItem, setGameItem] = useState({
    name: '',
    type: 'weapon',
    rarity: 'common',
    minLevel: 1,
    image: '',
    requiredClass: [],
    requiredStats: {
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      endurance: 0,
      charisma: 0
    },
    description: '',
    stats: {
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      endurance: 0,
      charisma: 0,
      damage: 0,
      armor: 0,
      criticalChance: 0,
      criticalDamage: 0,
      dodge: 0,
      healthRegenRate: 0,
      health: 0,
      counterAttack: 0
    },
    isStackable: false,
    maxQuantity: 1,
  });
  const [error, setError] = useState('');

  const fetchGameItem = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Токен отсутствует. Перенаправление на страницу входа.');
        navigate('/login');
        return;
      }
      const response = await axios.get(`${APP_SERVER_URL}/api/gameItem/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGameItem(response.data);
    } catch (error) {
      console.error('Ошибка получения игрового предмета:', error.response?.data || error.message);
      setError('Ошибка загрузки данных игрового предмета. Пожалуйста, попробуйте еще раз.');

      if (error.response && error.response.status === 401) {
        console.log('Токен недействителен. Перенаправление на страницу входа.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchGameItem();
    }
  }, [id, fetchGameItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGameItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setGameItem(prev => ({
      ...prev,
      stats: { ...prev.stats, [name]: parseFloat(value) }
    }));
  };

  const handleRequiredStatsChange = (e) => {
    const { name, value } = e.target;
    setGameItem(prev => ({
      ...prev,
      requiredStats: { ...prev.requiredStats, [name]: parseFloat(value) }
    }));
  };

  const handleRequiredClassChange = (e) => {
    const { value, checked } = e.target;
    setGameItem(prev => ({
      ...prev,
      requiredClass: checked
        ? [...prev.requiredClass, value]
        : prev.requiredClass.filter(c => c !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Токен отсутствует. Перенаправление на страницу входа.');
        navigate('/login');
        return;
      }
      if (id) {
        await axios.put(`${APP_SERVER_URL}/api/gameItem/${id}`, gameItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${APP_SERVER_URL}/api/gameItem`, gameItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/admin/gameItem');
    } catch (error) {
      console.error('Ошибка сохранения игрового предмета:', error.response?.data || error.message);
      setError('Ошибка сохранения игрового предмета. Пожалуйста, проверьте данные и попробуйте еще раз.');

      if (error.response && error.response.status === 401) {
        console.log('Токен недействителен. Перенаправление на страницу входа.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">{id ? 'Редактирование' : 'Создание'} игрового предмета</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <InputField label="Название" name="name" value={gameItem.name} onChange={handleChange} />
            <SelectField
              label="Тип"
              name="type"
              value={gameItem.type}
              onChange={handleChange}
              options={['weapon', 'armor', 'banner', 'helmet', 'shield', 'cloak', 'belt', 'boots', 'useful']}
            />
            <SelectField
              label="Редкость"
              name="rarity"
              value={gameItem.rarity}
              onChange={handleChange}
              options={['common', 'uncommon', 'rare', 'epic', 'legendary']}
            />
            <InputField label="Изображение" name="image" value={gameItem.image} onChange={handleChange} />
            <InputField
              label="Складируемый"
              name="isStackable"
              value={gameItem.isStackable}
              onChange={handleChange}
              type="checkbox"
            />
            {gameItem.isStackable && (
              <InputField
                label="Макс. количество"
                name="maxQuantity"
                value={gameItem.maxQuantity}
                onChange={handleChange}
                type="number"
              />
            )}
            <textarea
              name="description"
              value={gameItem.description}
              onChange={handleChange}
              placeholder="Описание предмета"
              className="w-full px-2 py-1 border rounded"
              rows="4"
            />
          </div>
          <div>
            <h3 className="font-bold mb-2">Требуемые характеристики:</h3>
            <InputField label="Мин. уровень" name="minLevel" value={gameItem.minLevel} onChange={handleChange} type="number" />
            <InputField label="Сила" name="strength" value={gameItem.requiredStats.strength} onChange={handleRequiredStatsChange} type="number" />
            <InputField label="Ловкость" name="dexterity" value={gameItem.requiredStats.dexterity} onChange={handleRequiredStatsChange} type="number" />
            <InputField label="Интеллект" name="intelligence" value={gameItem.requiredStats.intelligence} onChange={handleRequiredStatsChange} type="number" />
            <InputField label="Выносливость" name="endurance" value={gameItem.requiredStats.endurance} onChange={handleRequiredStatsChange} type="number" />
            <InputField label="Харизма" name="charisma" value={gameItem.requiredStats.charisma} onChange={handleRequiredStatsChange} type="number" />
            <CheckboxField
              label="Требуемый класс"
              name="requiredClass"
              value={gameItem.requiredClass}
              onChange={handleRequiredClassChange}
              options={['Warrior', 'Mage', 'Archer']}
            />
          </div>
          <div>
            <h3 className="font-bold mb-2">Бонусы предмета:</h3>
            <InputField label="Сила" name="strength" value={gameItem.stats.strength} onChange={handleStatsChange} type="number" />
            <InputField label="Ловкость" name="dexterity" value={gameItem.stats.dexterity} onChange={handleStatsChange} type="number" />
            <InputField label="Интеллект" name="intelligence" value={gameItem.stats.intelligence} onChange={handleStatsChange} type="number" />
            <InputField label="Выносливость" name="endurance" value={gameItem.stats.endurance} onChange={handleStatsChange} type="number" />
            <InputField label="Харизма" name="charisma" value={gameItem.stats.charisma} onChange={handleStatsChange} type="number" />
            <InputField label="Урон" name="damage" value={gameItem.stats.damage} onChange={handleStatsChange} type="number" />
            <InputField label="Броня" name="armor" value={gameItem.stats.armor} onChange={handleStatsChange} type="number" />
            <InputField label="Шанс крита" name="criticalChance" value={gameItem.stats.criticalChance} onChange={handleStatsChange} type="number" />
            <InputField label="Сила крита" name="criticalDamage" value={gameItem.stats.criticalDamage} onChange={handleStatsChange} type="number" />
            <InputField label="Уворот" name="dodge" value={gameItem.stats.dodge} onChange={handleStatsChange} type="number" />
            <InputField label="Контрудар" name="counterAttack" value={gameItem.stats.counterAttack} onChange={handleStatsChange} type="number" />
            <InputField label="HP" name="health" value={gameItem.stats.health} onChange={handleStatsChange} type="number" />
            <InputField label="Реген HP" name="healthRegenRate" value={gameItem.stats.healthRegenRate} onChange={handleStatsChange} type="number" />
          </div>
          <div className="col-span-3 mt-4">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {id ? 'Обновить предмет' : 'Создать предмет'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGameItemForm;