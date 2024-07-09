import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <h1>Личный кабинет</h1>
      <p>Добро пожаловать, {user.username}!</p>
      <p>Email: {user.email}</p>
      {/* Здесь можно добавить дополнительную информацию о персонаже */}
    </DashboardContainer>
  );
};

export default Dashboard;