interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export function Input({ value, onChange, placeholder, type = 'text', className = '' }: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-border-color bg-bg-input text-text-primary rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue placeholder:text-text-secondary/50 w-full transition-all duration-150 ${className}`}
    />
  );
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Textarea({ value, onChange, placeholder, className = '' }: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-border-color bg-bg-input text-text-primary rounded-lg p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue leading-relaxed font-sans placeholder:text-text-secondary/50 w-full min-h-[120px] transition-all duration-150 ${className}`}
    />
  );
}
