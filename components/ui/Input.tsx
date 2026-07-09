'use client';

import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  theme?: 'light' | 'dark';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, theme = 'dark', type = 'text', className = '', onFocus, onBlur, onChange, value, defaultValue, ...props }, ref) => {
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
        color: '#888888',
        fontSize: '13px',
      },
      floating: {
        y: -10,
        scale: 0.85,
        color: error ? '#DC2626' : (theme === 'light' ? '#111111' : '#FFFFFF'),
        fontSize: '11px',
      },
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full mb-4">
        <div
          className={`relative border rounded-sm transition-colors duration-200 ${theme === 'light' ? 'bg-[#FFFFFF]' : 'bg-neutral-950'} ${
            error
              ? 'border-red-600'
              : isFocused
              ? (theme === 'light' ? 'border-[rgba(0,0,0,0.3)]' : 'border-white/30')
              : (theme === 'light' ? 'border-[rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.2)]' : 'border-white/10 hover:border-white/20')
          }`}
        >
          {/* Animated Floating Label */}
          <motion.label
            animate={isFloating ? 'floating' : 'idle'}
            variants={labelVariants}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ originX: 0 }}
            className="absolute left-4 pointer-events-none select-none font-mono font-semibold tracking-wider uppercase"
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
            className={`w-full px-4 pt-5 pb-2 text-[13px] ${theme === 'light' ? 'text-[#111111]' : 'text-white'} bg-transparent outline-none ${className}`}
            {...props}
          />
        </div>

        {/* Error or helper message */}
        {error ? (
          <p className="mt-1.5 text-[10px] text-red-500 font-mono tracking-wider uppercase">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-[10px] text-neutral-500 font-mono tracking-wider uppercase">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
