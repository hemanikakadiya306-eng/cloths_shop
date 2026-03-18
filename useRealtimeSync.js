import { useEffect, useState } from 'react';
import realtimeService from '../services/realtimeService';

export const useRealtimeSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Connect to admin server
    const socket = realtimeService.connect();
    
    if (socket) {
      // Update connection status
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      
      realtimeService.addEventListener('connect', handleConnect);
      realtimeService.addEventListener('disconnect', handleDisconnect);
      
      // Cleanup on unmount
      return () => {
        realtimeService.removeEventListener('connect', handleConnect);
        realtimeService.removeEventListener('disconnect', handleDisconnect);
        realtimeService.disconnect();
      };
    }
  }, []);

  const listenToProducts = (callback) => {
    realtimeService.addEventListener('product-added', callback);
    realtimeService.addEventListener('product-updated', callback);
    realtimeService.addEventListener('product-deleted', callback);
    
    return () => {
      realtimeService.removeEventListener('product-added', callback);
      realtimeService.removeEventListener('product-updated', callback);
      realtimeService.removeEventListener('product-deleted', callback);
    };
  };

  const listenToCategories = (callback) => {
    realtimeService.addEventListener('category-added', callback);
    realtimeService.addEventListener('category-updated', callback);
    realtimeService.addEventListener('category-deleted', callback);
    
    return () => {
      realtimeService.removeEventListener('category-added', callback);
      realtimeService.removeEventListener('category-updated', callback);
      realtimeService.removeEventListener('category-deleted', callback);
    };
  };

  return {
    isConnected,
    lastUpdate,
    listenToProducts,
    listenToCategories
  };
};
