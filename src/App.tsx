import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { initDatabase } from './lib/db';
import { initializeTheme } from './lib/theme';

export function App() {
  useEffect(() => {
    // Initialize theme system
    initializeTheme();
    
    // Initialize database
    initDatabase().catch(console.error);
  }, []);

  return (
    <div className="app-layout">
      <main className="main-content">
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
}
