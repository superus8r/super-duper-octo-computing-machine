/**
 * Utility functions for PWA features
 */

// Haptic feedback support
export class HapticFeedback {
  private static isSupported = 'vibrate' in navigator;
  
  /**
   * Trigger light haptic feedback
   */
  static light(): void {
    if (this.isSupported) {
      navigator.vibrate(10);
    }
  }
  
  /**
   * Trigger medium haptic feedback
   */
  static medium(): void {
    if (this.isSupported) {
      navigator.vibrate(20);
    }
  }
  
  /**
   * Trigger heavy haptic feedback
   */
  static heavy(): void {
    if (this.isSupported) {
      navigator.vibrate([30, 10, 30]);
    }
  }
  
  /**
   * Trigger success haptic feedback
   */
  static success(): void {
    if (this.isSupported) {
      navigator.vibrate([10, 5, 10]);
    }
  }
  
  /**
   * Trigger error haptic feedback
   */
  static error(): void {
    if (this.isSupported) {
      navigator.vibrate([50, 10, 50, 10, 50]);
    }
  }
  
  /**
   * Check if haptic feedback is supported
   */
  static get supported(): boolean {
    return this.isSupported;
  }
}

// Network status monitoring
export class NetworkMonitor {
  private static callbacks: Set<(online: boolean) => void> = new Set();
  private static initialized = false;
  
  /**
   * Initialize network monitoring
   */
  static init(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }
    
    this.initialized = true;
    
    window.addEventListener('online', () => {
      console.log('Network: Online');
      this.notifyCallbacks(true);
    });
    
    window.addEventListener('offline', () => {
      console.log('Network: Offline');
      this.notifyCallbacks(false);
    });
  }
  
  /**
   * Check if currently online
   */
  static get isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
  
  /**
   * Subscribe to network status changes
   */
  static subscribe(callback: (online: boolean) => void): () => void {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }
  
  /**
   * Notify all subscribers of network status change
   */
  private static notifyCallbacks(online: boolean): void {
    this.callbacks.forEach(callback => {
      try {
        callback(online);
      } catch (error) {
        console.error('Network callback error:', error);
      }
    });
  }
  
  /**
   * Test actual connectivity with a lightweight request
   */
  static async testConnectivity(): Promise<boolean> {
    if (!this.isOnline) {
      return false;
    }
    
    try {
      const response = await fetch('/manifest.webmanifest', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Service Worker utilities
export class ServiceWorkerManager {
  private static registration: ServiceWorkerRegistration | null = null;
  
  /**
   * Register service worker
   */
  static async register(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.registration = registration;
        
        console.log('Service Worker registered:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }
  
  /**
   * Check for service worker updates
   */
  static async checkForUpdates(): Promise<boolean> {
    if (this.registration) {
      try {
        await this.registration.update();
        return true;
      } catch (error) {
        console.error('Service Worker update check failed:', error);
        return false;
      }
    }
    return false;
  }
  
  /**
   * Get service worker version
   */
  static async getVersion(): Promise<string | null> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version || null);
        };
        
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage(
            { type: 'GET_VERSION' },
            [messageChannel.port2]
          );
        } else {
          resolve(null);
        }
      });
    }
    return null;
  }
}

// PWA installation utilities
export class PWAInstaller {
  private static deferredPrompt: BeforeInstallPromptEvent | null = null;
  
  /**
   * Initialize PWA installation handling
   */
  static init(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      console.log('PWA install prompt ready');
    });
    
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.deferredPrompt = null;
    });
  }
  
  /**
   * Check if PWA can be installed
   */
  static get canInstall(): boolean {
    return this.deferredPrompt !== null;
  }
  
  /**
   * Trigger PWA installation
   */
  static async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }
    
    try {
      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      
      console.log('PWA install result:', result.outcome);
      this.deferredPrompt = null;
      
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }
  
  /**
   * Check if running as PWA
   */
  static get isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  }
}

// Accessibility utilities
export class AccessibilityManager {
  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (typeof document === 'undefined') {
      return;
    }
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  /**
   * Focus first focusable element in container
   */
  static focusFirst(container: HTMLElement): boolean {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (focusable) {
      focusable.focus();
      return true;
    }
    return false;
  }
  
  /**
   * Trap focus within container
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
}

// Format utilities
export class FormatUtils {
  /**
   * Format currency based on locale and currency code
   */
  static currency(amount: number, currencyCode: string = 'EUR'): string {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      // Fallback for unsupported currencies
      const symbols: Record<string, string> = {
        EUR: '€',
        USD: '$',
        GBP: '£'
      };
      const symbol = symbols[currencyCode] || currencyCode;
      return `${symbol}${amount.toFixed(2)}`;
    }
  }
  
  /**
   * Format date relative to now
   */
  static relativeDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  /**
   * Pluralize text based on count
   */
  static pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) {
      return singular;
    }
    return plural || `${singular}s`;
  }
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}