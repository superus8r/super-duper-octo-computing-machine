import { useEffect, useState } from 'react';
import { NetworkMonitor } from '../lib/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(NetworkMonitor.isOnline);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize network monitoring
    NetworkMonitor.init();

    // Subscribe to network changes
    const unsubscribe = NetworkMonitor.subscribe((online) => {
      setIsOnline(online);
      
      if (!online) {
        // Show immediately when going offline
        setIsVisible(true);
      } else {
        // Hide after a brief delay when coming back online
        setTimeout(() => setIsVisible(false), 2000);
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  if (!isVisible && isOnline) {
    return null;
  }

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="offline-content">
        {isOnline ? (
          <>
            <span className="offline-icon">✓</span>
            <span>Back online</span>
          </>
        ) : (
          <>
            <span className="offline-icon">⚠️</span>
            <span>You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}