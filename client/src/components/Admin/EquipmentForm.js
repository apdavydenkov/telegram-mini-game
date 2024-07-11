import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const EquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState({
    name: '',
    type: '',
    stats: {
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      endurance: 0,
      charisma: 0,
      health: 0,
      attack: 0,
      defense: 0,
      dodge: 0,
      criticalChance: 0,
      criticalDamage: 0
    },
    rarity: '',
    minLevel: 1,
    description: ''
  });

  useEffect(() => {
    if (id) {
      fetchEquipment();
    }
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error.response?.data || error.message);
      // Можно добавить обработку ошибки аутентификации
      if (error.response && error.response.status === 401) {
        // Например, перенаправление на страницу входа
        // navigate('/login');
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
      stats: { ...prev.stats, [name]: parseInt(value) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`${API_BASE_URL}/api/equipment/${id}`, equipment, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/equipment`, equipment, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/admin/equipment');
    } catch (error) {
      console.error('Error saving equipment:', error.response?.data || error.message);
      // Обработка ошибки аутентификации
      if (error.response && error.response.status === 401) {
        // Например, перенаправление на страницу входа
        // navigate('/login');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Name:</label>
        <input
          type="text"
          name="name"
          value={equipment.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Type:</label>
        <select
          name="type"
          value={equipment.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Select Type</option>
          <option value="weapon">Weapon</option>
          <option value="armor">Armor</option>
          <option value="accessory">Accessory</option>
          <option value="banner">Banner</option>
          <option value="helmet">Helmet</option>
          <option value="shield">Shield</option>
          <option value="cloak">Cloak</option>
          <option value="belt">Belt</option>
          <option value="boots">Boots</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Stats:</label>
        {Object.entries(equipment.stats).map(([stat, value]) => (
          <div key={stat} className="flex items-center space-x-2 mb-2">
            <label>{stat}:</label>
            <input
              type="number"
              name={stat}
              value={value}
              onChange={handleStatsChange}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block mb-1">Rarity:</label>
        <select
          name="rarity"
          value={equipment.rarity}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Select Rarity</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Minimum Level:</label>
        <input
          type="number"
          name="minLevel"
          value={equipment.minLevel}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Description:</label>
        <textarea
          name="description"
          value={equipment.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          rows="3"
        ></textarea>
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        {id ? 'Update Equipment' : 'Create Equipment'}
      </button>
    </form>
  );
};

export default EquipmentForm;