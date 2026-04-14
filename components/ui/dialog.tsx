'use client';

import React, { useEffect, useRef, createContext, useContext, useState } from 'react';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);
  const isControlled = onOpenChange !== undefined;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;
  const actualOpen = isControlled ? open : internalOpen;

  return (
    <DialogContext.Provider value={{ open: actualOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const { open, setOpen } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: () => setOpen(!open),
    });
  }

  return (
    <button onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  const { open, setOpen } = useDialogContext();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div
        ref={dialogRef}
        className={`relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div className={`px-4 py-3 border-b border-[color:var(--border-soft)] ${className}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h3 className={`text-lg font-medium text-[color:var(--ink)] ${className}`}>
      {children}
    </h3>
  );
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`px-4 py-3 border-t border-[color:var(--border-soft)] flex gap-2 justify-end ${className}`}>
      {children}
    </div>
  );
}

interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogBody({ children, className = '' }: DialogBodyProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}