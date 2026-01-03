import { ReactNode } from 'react';
import { cn } from './ui/utils';

interface BottomActionBarProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export function BottomActionBar({
  children,
  className,
  innerClassName,
}: BottomActionBarProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg',
        className
      )}
    >
      <div
        className={cn(
          'max-w-2xl mx-auto flex flex-col gap-3 sm:flex-row',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
