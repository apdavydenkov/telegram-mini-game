import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APP_SERVER_URL } from '../../config/config';

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="flex justify-between items-center mb-2">
    <label className="text-right pr-2 w-1/2">{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-1/2 h-[25px] px-2 border rounded text-right"
    />
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

const AdminEquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState({
    name: '', type: '', rarity: '', minLevel: 1, image: '',
    stats: {
      strength: 0, dexterity: 0, intelligence: 0, endurance: 0, charisma: 0,
      damage: 0, armor: 0, criticalChance: 0, criticalDamage: 0, dodge: 0,
      healthRegen: 0, health: 0, counterAttack: 0
    }
  });

  useEffect(() => {
    if (id) {
      fetchEquipment();
    }
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Токен отсутствует. Перенаправление на страницу входа.');
        navigate('/login');
        return;
      }
      const response = await axios.get(`${APP_SERVER_URL}/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data);
    } catch (error) {
      console.error('Ошибка получения предмета:', error.response?.data || error.message);

      // Проверяем, является ли ошибка связанной с аутентификацией
      if (error.response && error.response.status === 401) {
        console.log('Токен недействителен. Перенаправление на страницу входа.');
        localStorage.removeItem('token'); // Удаляем недействительный токен
        navigate('/login'); // Перенаправляем на страницу входа
      } else {
        // Обработка других типов ошибок
        // Например, можно показать пользователю сообщение об ошибке
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipment(prev => ({ ...prev, [name]: value }));
  };

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setEquipment(prev => ({
      ...prev,
      stats: { ...prev.stats, [name]: parseFloat(value) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`${APP_SERVER_URL}/api/equipment/${id}`, equipment, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${APP_SERVER_URL}/api/equipment`, equipment, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/admin/equipment');
    } catch (error) {
      console.error('Ошибка сохранения предмета:', error.response?.data || error.message);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Создание предметов - Экипировка</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <InputField label="Название" name="name" value={equipment.name} onChange={handleChange} />
            <SelectField
              label="Тип"
              name="type"
              value={equipment.type}
              onChange={handleChange}
              options={['weapon', 'armor', 'accessory', 'banner', 'helmet', 'shield', 'cloak', 'belt', 'boots']}
            />
            <SelectField
              label="Редкость"
              name="rarity"
              value={equipment.rarity}
              onChange={handleChange}
              options={['common', 'uncommon', 'rare', 'epic', 'legendary']}
            />
            <InputField label="Мин. уровень" name="minLevel" value={equipment.minLevel} onChange={handleChange} type="number" />
            <InputField label="Изображение" name="image" value={equipment.image} onChange={handleChange} />
          </div>
          <div>
            <InputField label="Сила" name="strength" value={equipment.stats.strength} onChange={handleStatsChange} type="number" />
            <InputField label="Ловкость" name="dexterity" value={equipment.stats.dexterity} onChange={handleStatsChange} type="number" />
            <InputField label="Интеллект" name="intelligence" value={equipment.stats.intelligence} onChange={handleStatsChange} type="number" />
            <InputField label="Выносливость" name="endurance" value={equipment.stats.endurance} onChange={handleStatsChange} type="number" />
            <InputField label="Харизма" name="charisma" value={equipment.stats.charisma} onChange={handleStatsChange} type="number" />
          </div>
          <div>
            <InputField label="Урон" name="damage" value={equipment.stats.damage} onChange={handleStatsChange} type="number" />
            <InputField label="Броня" name="armor" value={equipment.stats.armor} onChange={handleStatsChange} type="number" />
            <InputField label="Шанс крита" name="criticalChance" value={equipment.stats.criticalChance} onChange={handleStatsChange} type="number" />
            <InputField label="Сила крита" name="criticalDamage" value={equipment.stats.criticalDamage} onChange={handleStatsChange} type="number" />
            <InputField label="Уворот" name="dodge" value={equipment.stats.dodge} onChange={handleStatsChange} type="number" />
            <InputField label="Контрудар" name="counterAttack" value={equipment.stats.counterAttack} onChange={handleStatsChange} type="number" />
            <InputField label="HP" name="health" value={equipment.stats.health} onChange={handleStatsChange} type="number" />
            <InputField label="Реген" name="healthRegen" value={equipment.stats.healthRegen} onChange={handleStatsChange} type="number" />
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

export default AdminEquipmentForm;