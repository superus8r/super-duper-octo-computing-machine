import { useEffect } from 'react';
import type React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { initDatabase } from './lib/db';
import { initializeTheme } from './lib/theme';
import { ServiceWorkerManager, PWAInstaller, NetworkMonitor } from './lib/utils';

export function App() {
  useEffect(() => {
    // Initialize theme system
    initializeTheme();
    
    // Initialize database
    initDatabase().catch(console.error);
    
    // Initialize PWA features
    initializePWAFeatures();
  }, []);

  const initializePWAFeatures = async () => {
    try {
      // Register service worker
      await ServiceWorkerManager.register();
      
      // Initialize PWA installer
      PWAInstaller.init();
      
      // Initialize network monitoring
      NetworkMonitor.init();
      
      console.log('PWA features initialized');
    } catch (error) {
      console.error('Failed to initialize PWA features:', error);
    }
  };

  return (
    <div className="app-layout" style={{ '--nav-height': '72px' } as React.CSSProperties}>
      <OfflineIndicator />
      <main className="main-content">
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
}
