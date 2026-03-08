import { useEffect, useState } from 'react';
import { getOrCreateDeviceId } from '../storage/token-storage';

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  return deviceId;
};
