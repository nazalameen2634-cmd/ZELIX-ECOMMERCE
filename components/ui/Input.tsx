'use client';

import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, type = 'text', className = '', onFocus, onBlur, onChange, value, defaultValue, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      !!value || !!defaultValue || false
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (e.target.value === '') {
        setHasValue(false);
      }
      if (onBlur) onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value !== '');
      if (onChange) onChange(e);
    };

    // Label animation variants
    const labelVariants = {
      idle: {
        y: 12,
        scale: 1,
        color: 'var(--color-muted)',
        fontSize: '14px',
      },
      floating: {
        y: -10,
        scale: 0.85,
        color: error ? 'var(--color-error)' : 'var(--color-foreground)',
        fontSize: '12px',
      },
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full mb-4">
        <div
          className={`relative border rounded-[14px] bg-white transition-all duration-300 ${
            error
              ? 'border-error'
              : isFocused
              ? 'border-accent ring-2 ring-accent/20'
              : 'border-border hover:border-gray-300'
          }`}
        >
          {/* Animated Floating Label */}
          <motion.label
            animate={isFloating ? 'floating' : 'idle'}
            variants={labelVariants}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ originX: 0 }}
            className="absolute left-4 pointer-events-none select-none font-sans font-medium"
          >
            {label}
          </motion.label>

          {/* Standard HTML Input */}
          <input
            ref={ref}
            type={type}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            value={value}
            defaultValue={defaultValue}
            className={`w-full px-4 pt-5 pb-2 text-[14px] text-foreground bg-transparent outline-none ${className}`}
            {...props}
          />
        </div>

        {/* Error or helper message */}
        {error ? (
          <p className="mt-1.5 text-xs text-error font-sans">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-muted font-sans">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
