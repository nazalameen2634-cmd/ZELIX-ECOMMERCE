'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  // Styles configuration
  const baseStyle =
    'relative inline-flex items-center justify-center font-sans font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent rounded-[14px] cursor-pointer select-none';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md hover:-translate-y-[1px]',
    secondary:
      'bg-white text-foreground hover:bg-gray-50 border border-border',
    outline:
      'bg-transparent text-foreground border border-border hover:border-foreground/30 hover:bg-black/5',
    ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-black/5',
    destructive: 'bg-error text-white hover:bg-error/90 border border-transparent',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-sm px-4 py-2 gap-1.5',
    md: 'text-base px-[28px] py-[14px] gap-2',
    lg: 'text-lg px-8 py-4 gap-2.5',
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      disabled={isDisabled}
      className={`${baseStyle} ${currentVariant} ${currentSize} ${
        isDisabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          LOADING
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
