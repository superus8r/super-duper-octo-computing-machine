import { NavLink } from 'react-router-dom';

// Simple SVG icons as components
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
  { path: '/new', label: 'New List', icon: PlusIcon },
  { path: '/profile', label: 'Profile', icon: UserIcon },
];

export function NavBar() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-10"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="container">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 p-2 rounded-md transition-colors
                ${isActive 
                  ? 'text-primary' 
                  : 'text-fg-muted hover:text-fg'
                }
              `}
              aria-label={label}
            >
              <Icon />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}