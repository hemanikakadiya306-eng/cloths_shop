import React, { useState, useEffect } from 'react';
import realtimeService from '../services/realtimeService';
import { toast } from 'react-toastify';

const RealtimeSync = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    reconnectAttempts: 0
  });

  useEffect(() => {
    // Connect to admin server
    const socket = realtimeService.connect();
    
    if (socket) {
      // Update connection status
      const handleConnect = () => {
        setConnectionStatus({ connected: true, reconnectAttempts: 0 });
        toast.success('Connected to real-time server', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      };
      
      const handleDisconnect = () => {
        setConnectionStatus(prev => ({ ...prev, connected: false }));
        toast.error('Disconnected from real-time server', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      };
      
      const handleConnectError = (data) => {
        setConnectionStatus(prev => ({ ...prev, connected: false }));
        toast.error(`Connection error: ${data.error}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      };
      
      realtimeService.addEventListener('connect', handleConnect);
      realtimeService.addEventListener('disconnect', handleDisconnect);
      realtimeService.addEventListener('connect_error', handleConnectError);
      
      // Listen for product changes
      const handleProductAdded = (product) => {
        toast.success(`New product added: ${product.name}`, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
        // Trigger page refresh or state update
        window.dispatchEvent(new CustomEvent('product-added', { detail: product }));
      };
      
      const handleProductUpdated = (product) => {
        toast.info(`Product updated: ${product.name}`, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
        // Trigger page refresh or state update
        window.dispatchEvent(new CustomEvent('product-updated', { detail: product }));
      };
      
      const handleProductDeleted = (productId) => {
        toast.warning('Product deleted from store', {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
        // Trigger page refresh or state update
        window.dispatchEvent(new CustomEvent('product-deleted', { detail: productId }));
      };
      
      // Listen for category changes
      const handleCategoryAdded = (category) => {
        toast.success(`New category added: ${category.name}`, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
        // Trigger page refresh or state update
        window.dispatchEvent(new CustomEvent('category-added', { detail: category }));
      };
      
      const handleCategoryUpdated = (category) => {
        toast.info(`Category updated: ${category.name}`, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
        // Trigger page refresh or state update
        window.dispatchEvent(new CustomEvent('category-updated', { detail: category }));
      };
      
      const handleCategoryDeleted = (categoryId) => {
        toast.warning('Category deleted from store', {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
        // Trigger page refresh or state update
        window.dispatchEvent(new CustomEvent('category-deleted', { detail: categoryId }));
      };
      
      realtimeService.addEventListener('product-added', handleProductAdded);
      realtimeService.addEventListener('product-updated', handleProductUpdated);
      realtimeService.addEventListener('product-deleted', handleProductDeleted);
      realtimeService.addEventListener('category-added', handleCategoryAdded);
      realtimeService.addEventListener('category-updated', handleCategoryUpdated);
      realtimeService.addEventListener('category-deleted', handleCategoryDeleted);
      
      // Cleanup on unmount
      return () => {
        realtimeService.removeEventListener('connect', handleConnect);
        realtimeService.removeEventListener('disconnect', handleDisconnect);
        realtimeService.removeEventListener('connect_error', handleConnectError);
        realtimeService.removeEventListener('product-added', handleProductAdded);
        realtimeService.removeEventListener('product-updated', handleProductUpdated);
        realtimeService.removeEventListener('product-deleted', handleProductDeleted);
        realtimeService.removeEventListener('category-added', handleCategoryAdded);
        realtimeService.removeEventListener('category-updated', handleCategoryUpdated);
        realtimeService.removeEventListener('category-deleted', handleCategoryDeleted);
        realtimeService.disconnect();
      };
    }
  }, []);

  // Manual reconnection function
  const handleReconnect = () => {
    toast.info('Attempting to reconnect...', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
    realtimeService.reconnect();
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: connectionStatus.connected ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={handleReconnect}
        title={connectionStatus.connected ? 'Connected to admin server' : 'Click to reconnect'}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            animation: connectionStatus.connected ? 'pulse 2s infinite' : 'none'
          }}
        />
        <span>
          {connectionStatus.connected ? 'Real-time Sync' : `Reconnecting... (${connectionStatus.reconnectAttempts}/5)`}
        </span>
      </div>

      {/* Pulse Animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>

      {/* Render children */}
      {children}
    </>
  );
};

export default RealtimeSync;
