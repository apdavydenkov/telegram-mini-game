import React from 'react';
import axios from 'axios';

const MakeAdminButton = () => {
  const handleMakeAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/auth/make-admin', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Make admin response:', response.data);
      // Обновите пользователя в localStorage
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('You are now an admin!');
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Failed to become admin');
    }
  };

  return (
    <button onClick={handleMakeAdmin}>
      Make me an admin
    </button>
  );
};

export default MakeAdminButton;