import type { ThemePref } from './types';

const THEME_STORAGE_KEY = 'shopping-list-theme';
const HTML_THEME_ATTR = 'data-theme';

// Theme colors for meta tags
const THEME_COLORS = {
  light: '#ffffff',
  dark: '#1a1a1a',
} as const;

/**
 * Detect system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

/**
 * Get the stored theme preference or default to 'system'
 */
export function getStoredTheme(): ThemePref {
  if (typeof localStorage === 'undefined') {
    return 'system';
  }
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  
  return 'system';
}

/**
 * Store theme preference in localStorage
 */
export function setStoredTheme(theme: ThemePref): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Resolve theme preference to actual theme
 */
export function resolveTheme(preference: ThemePref): 'light' | 'dark' {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

/**
 * Apply theme to the document
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  // Set data-theme attribute on html element
  document.documentElement.setAttribute(HTML_THEME_ATTR, theme);
  
  // Update theme-color meta tag
  updateThemeColorMeta(theme);
}

/**
 * Update the theme-color meta tag
 */
function updateThemeColorMeta(theme: 'light' | 'dark'): void {
  let metaTag = document.querySelector('meta[name="theme-color"]');
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', THEME_COLORS[theme]);
}

/**
 * Initialize theme system
 */
export function initializeTheme(): 'light' | 'dark' {
  const preference = getStoredTheme();
  const resolved = resolveTheme(preference);
  applyTheme(resolved);
  
  // Listen for system theme changes if preference is 'system'
  if (preference === 'system' && typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      // Only update if user preference is still 'system'
      if (getStoredTheme() === 'system') {
        const newSystemTheme = getSystemTheme();
        applyTheme(newSystemTheme);
      }
    };
    
    // Add listener with fallback for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }
  
  return resolved;
}

/**
 * Set and apply theme preference
 */
export function setTheme(preference: ThemePref): 'light' | 'dark' {
  setStoredTheme(preference);
  const resolved = resolveTheme(preference);
  applyTheme(resolved);
  return resolved;
}