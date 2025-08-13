import { useState, useCallback } from 'react';

export interface SnackbarOptions {
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SnackbarState {
  id: string;
  message: string;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Hook for managing snackbar notifications with undo functionality
 */
export function useSnackbar() {
  const [snackbars, setSnackbars] = useState<SnackbarState[]>([]);

  const showSnackbar = useCallback((options: SnackbarOptions) => {
    const id = Date.now().toString();
    const snackbar: SnackbarState = {
      id,
      message: options.message,
      duration: options.duration ?? 5000,
      action: options.action,
    };

    setSnackbars(prev => [...prev, snackbar]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setSnackbars(prev => prev.filter(s => s.id !== id));
    }, snackbar.duration);

    return id;
  }, []);

  const dismissSnackbar = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(s => s.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setSnackbars([]);
  }, []);

  return {
    snackbars,
    showSnackbar,
    dismissSnackbar,
    dismissAll,
  };
}