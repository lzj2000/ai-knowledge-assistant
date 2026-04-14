import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-[color:var(--surface-strong)] border border-[color:var(--border-soft)] rounded-[20px] shadow-[color:var(--shadow-card)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: CardProps) {
  return (
    <div className={`p-5 border-b border-[color:var(--border-soft)] ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children }: CardProps) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children }: CardProps) {
  return (
    <div className={`p-5 border-t border-[color:var(--border-soft)] ${className}`}>
      {children}
    </div>
  );
}