import { useState, useEffect, useCallback } from 'react';
import { characterAPI } from '../services/api';


const useCharacterStatus = (initialStatus) => {
  const [status, setStatus] = useState(initialStatus || { user: 'idle', auto: null });

  const fetchStatus = useCallback(async () => {
    try {
      const response = await characterAPI.getStatus();
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }, []);

  const updateStatus = useCallback(async (newStatus) => {
    try {
      const response = await characterAPI.updateStatus('user', newStatus);
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