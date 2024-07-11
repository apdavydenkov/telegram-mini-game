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
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/equipment/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  const handleAddToCharacter = (id) => {
    // This function will be implemented later
    console.log('Add to character:', id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Equipment</h2>
        <Link to="/admin/equipment/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
          Create New
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rarity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={item.image || "https://via.placeholder.com/150"} alt={item.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rarity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.minLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/admin/equipment/edit/${item._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 mr-3">Delete</button>
                  <button onClick={() => handleAddToCharacter(item._id)} className="text-green-600 hover:text-green-900">Add to Character</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentList;