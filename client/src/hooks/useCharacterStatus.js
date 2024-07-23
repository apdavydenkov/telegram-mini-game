import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { APP_SERVER_URL } from '../config/config';

const useCharacterStatus = (initialStatus) => {
  const [status, setStatus] = useState(initialStatus || { user: 'idle', auto: null });

  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${APP_SERVER_URL}/api/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }, []);

  const updateStatus = useCallback(async (newStatus) => {
    try {
      const response = await axios.put(`${APP_SERVER_URL}/api/status`, {
        statusType: 'user',
        newStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, updateStatus, fetchStatus };
};

export default useCharacterStatus;