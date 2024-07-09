import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 3px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

	const Login = () => {
	  const [username, setUsername] = useState('');
	  const [password, setPassword] = useState('');
	  const [error, setError] = useState('');
	  const navigate = useNavigate();

	  const handleSubmit = async (e) => {
		e.preventDefault();
		setError(''); // Сбрасываем ошибку перед новой попыткой
		try {
		  const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
		  localStorage.setItem('token', response.data.token);
		  navigate('/dashboard');
		} catch (error) {
		  console.error('Login error:', error);
		  setError(error.response?.data?.message || 'An error occurred during login');
		}
	  };

  return (
    <LoginContainer>
      <h2>Вход</h2>
	  {error && <ErrorMessage>{error}</ErrorMessage>}
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Войти</Button>
      </form>
    </LoginContainer>
  );
};

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
`;

export default Login; 
