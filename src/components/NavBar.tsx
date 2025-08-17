import { NavLink } from 'react-router-dom';
import type React from 'react';

// Simple SVG icons as components (kept from current implementation)
const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const navItems = [
  { path: '/', label: 'Lists', icon: ListIcon },
  { path: '/new', label: 'New', icon: PlusIcon },
  { path: '/profile', label: 'Profile', icon: UserIcon },
];

export function NavBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50"
      role="navigation"
      aria-label="Bottom navigation"
      style={{ '--bottom-nav-height': '72px' } as React.CSSProperties}
    >
      <div className="container-page" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="mx-auto mb-2 max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-card backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/80">
            <ul className="flex items-center justify-around py-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) => `flex min-w-16 min-h-11 flex-col items-center justify-center rounded-md px-4 py-2 text-xs font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
                    aria-label={label}
                  >
                    <Icon />
                    <span className="mt-1">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}