import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('useAuth: Fetching user data');
      setLoading(true);
      const response = await authAPI.getMe();
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('useAuth: Error fetching user data', err);
      setError(err.message);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    try {
      console.log('useAuth: Attempting login');
      setLoading(true);
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      await fetchUser();
    } catch (err) {
      console.error('useAuth: Login error', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log('useAuth: Attempting registration');
      setLoading(true);
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      await fetchUser();
    } catch (err) {
      console.error('useAuth: Registration error', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('useAuth: Logging out');
    localStorage.removeItem('token');
    setUser(null);
  };

  const makeAdmin = async () => {
    try {
      console.log('useAuth: Attempting to make user admin');
      setLoading(true);
      const response = await authAPI.makeAdmin();
      setUser(response.data.user);
    } catch (err) {
      console.error('useAuth: Make admin error', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, register, logout, makeAdmin, fetchUser };
};