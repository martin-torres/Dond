import { ReactNode } from 'react';
import { cn } from './ui/utils';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return <div className={cn('max-w-2xl w-full mx-auto', className)}>{children}</div>;
}
