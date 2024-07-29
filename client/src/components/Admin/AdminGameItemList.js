import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FilterSortPanel from '../Interface/FilterSortPanel';
import { gameItemAPI } from '../../services/api';

const AdminGameItemList = () => {
  const navigate = useNavigate();
  const [gameItems, setGameItems] = useState([]);
  const [filteredGameItems, setFilteredGameItems] = useState([]);

  const fetchGameItems = useCallback(async () => {
    try {
      const response = await gameItemAPI.getAll();
      setGameItems(response.data);
      setFilteredGameItems(response.data);
    } catch (error) {
      console.error('Error fetching game items:', error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate]);


  useEffect(() => {
    fetchGameItems();
  }, [fetchGameItems]);

  const handleDelete = async (gameItemId) => {
    if (window.confirm('Are you sure you want to delete this game item?')) {
      try {
        await gameItemAPI.delete(gameItemId);
        fetchGameItems();
      } catch (error) {
        console.error('Error deleting game item:', error);
      }
    }
  };

  const handleSendGameItem = async (gameItemId) => {
    const characterId = prompt("Enter the character ID to send the game item to:");
    const quantity = prompt("Enter the quantity to send:");
    if (characterId && quantity) {
      try {
        await gameItemAPI.send(gameItemId, characterId, parseInt(quantity, 10));
        alert('Game item sent successfully');
      } catch (error) {
        console.error('Error sending game item:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Error sending game item');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Game Items</h2>
        <Link to="/admin/gameItem/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
          Create New
        </Link>
      </div>
      <FilterSortPanel
        items={gameItems}
        onFilterSort={setFilteredGameItems}
        itemType="gameItem"
      />
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
            {filteredGameItems.map((gameItem) => (
              <tr key={gameItem._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10" src={gameItem.image || "https://placehold.co/150"} alt={gameItem.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{gameItem.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gameItem.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gameItem.rarity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gameItem.minLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/admin/gameItem/edit/${gameItem._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                  <button onClick={() => handleDelete(gameItem._id)} className="text-red-600 hover:text-red-900 mr-3">Delete</button>
                  <button onClick={() => handleSendGameItem(gameItem._id)} className="text-green-600 hover:text-green-900">Send</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminGameItemList;