import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-strong)] focus:ring-offset-2';

  const variants = {
    primary: 'bg-[color:var(--ink)] text-white hover:bg-[color:var(--accent-strong)]',
    secondary: 'bg-white text-[color:var(--ink)] ring-1 ring-[color:var(--border-strong)] hover:bg-[color:var(--surface)]',
    danger: 'bg-[#9f3b2f] text-white hover:bg-[#872f24]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">...</span>
          {children}
        </span>
      ) : children}
    </button>
  );
}