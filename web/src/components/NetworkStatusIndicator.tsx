/**
 * NetworkStatusIndicator Component
 * Shows current network status and handles offline scenarios
 */

import React, { useState, useEffect } from 'react';

const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Simple connection speed test
    const checkConnectionSpeed = async () => {
      const startTime = performance.now();
      try {
        await fetch('https://httpbin.org/delay/0', { method: 'HEAD' });
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // If request takes more than 1 second, consider it slow
        setIsSlowConnection(duration > 1000);
      } catch (error) {
        // If fetch fails, we might have connection issues
        setIsSlowConnection(true);
      }
    };

    // Check connection initially
    checkConnectionSpeed();

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection periodically
    const interval = setInterval(checkConnectionSpeed, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && !isSlowConnection) {
    return null; // Don't show when connection is good
  }

  let statusText = isOnline ? 'Slow connection' : 'Offline';
  let statusColor = isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  let icon = isOnline ? '🐌' : '📴';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center px-4 py-2 rounded-lg shadow-lg ${statusColor}`}>
        <span className="mr-2">{icon}</span>
        <span className="font-medium">{statusText}</span>
        {!isOnline && (
          <span className="ml-2 text-sm">You are currently offline. Changes may not be saved.</span>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusIndicator;