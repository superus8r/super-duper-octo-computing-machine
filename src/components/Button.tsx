import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { HapticFeedback } from '../lib/utils';
import { getSettings } from '../lib/db';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'none';
  children: ReactNode;
}

export function Button({ 
  variant = 'secondary',
  size = 'md', 
  haptic = 'light',
  onClick,
  className = '',
  disabled,
  children,
  ...props 
}: ButtonProps) {
  
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic feedback if enabled
    if (haptic !== 'none' && !disabled) {
      try {
        const settings = await getSettings();
        if (settings.hapticsEnabled) {
          switch (haptic) {
            case 'light':
              HapticFeedback.light();
              break;
            case 'medium':
              HapticFeedback.medium();
              break;
            case 'heavy':
              HapticFeedback.heavy();
              break;
            case 'success':
              HapticFeedback.success();
              break;
            case 'error':
              HapticFeedback.error();
              break;
          }
        }
      } catch (error) {
        // Haptic feedback is optional, don't fail the click
        console.debug('Haptic feedback failed:', error);
      }
    }
    
    // Call the original onClick handler
    if (onClick) {
      onClick(event);
    }
  };

  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const classes = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      className={classes}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}