// frontend/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label className="text-label">{label}</label>
      <input className="modern-input" {...props} />
    </div>
  );
}