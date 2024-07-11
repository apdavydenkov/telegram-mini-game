import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/equipment/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/equipment/${id}`);
        fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Equipment List</h2>
      <Link to="/admin/equipment/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block">
        Create New Equipment
      </Link>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Rarity</th>
            <th className="border p-2">Min Level</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item._id} className="hover:bg-gray-100">
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.type}</td>
              <td className="border p-2">{item.rarity}</td>
              <td className="border p-2">{item.minLevel}</td>
              <td className="border p-2">
                <Link to={`/admin/equipment/edit/${item._id}`} className="text-blue-500 hover:text-blue-700 mr-2">
                  Edit
                </Link>
                <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentList;