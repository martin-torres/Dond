import { ReactNode } from 'react';
import { cn } from './ui/utils';

type PageShellWidth = 'md' | 'lg' | 'xl';

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  cardClassName?: string;
  width?: PageShellWidth;
  paddedForActionBar?: boolean;
  headerSlot?: ReactNode;
  footer?: ReactNode;
}

const widthMap: Record<PageShellWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

export function PageShell({
  children,
  title,
  description,
  className,
  cardClassName,
  width = 'md',
  paddedForActionBar = false,
  headerSlot,
  footer,
}: PageShellProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-50',
        className
      )}
    >
      <div
        className={cn(
          'w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6',
          widthMap[width],
          paddedForActionBar && 'pb-24',
          cardClassName
        )}
      >
        {headerSlot ? (
          headerSlot
        ) : (title || description) && (
          <div className="space-y-1">
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
      {footer}
    </div>
  );
}
