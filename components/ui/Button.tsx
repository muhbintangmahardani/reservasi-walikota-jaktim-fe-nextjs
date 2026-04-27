// frontend/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({ isLoading, children, ...props }: ButtonProps) {
  return (
    <button 
      className="modern-button" 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Memproses...' : children}
    </button>
  );
}