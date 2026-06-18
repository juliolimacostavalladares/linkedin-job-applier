import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export function Input({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  className = '', 
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  return (
    <div className="relative flex items-center w-full">
      {startIcon && (
        <div className="absolute left-3 flex items-center pointer-events-none text-text-secondary/60">
          {startIcon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border border-border-color bg-bg-input text-text-primary rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue placeholder:text-text-secondary/50 w-full transition-all duration-150 ${
          startIcon ? 'pl-9' : ''
        } ${endIcon ? 'pr-9' : ''} ${className}`}
        {...props}
      />
      {endIcon && (
        <div className="absolute right-3 flex items-center pointer-events-none text-text-secondary/60">
          {endIcon}
        </div>
      )}
    </div>
  );
}

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function Textarea({ value, onChange, placeholder, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-border-color bg-bg-input text-text-primary rounded-lg p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue leading-relaxed font-sans placeholder:text-text-secondary/50 w-full min-h-[120px] transition-all duration-150 ${className}`}
      {...props}
    />
  );
}
