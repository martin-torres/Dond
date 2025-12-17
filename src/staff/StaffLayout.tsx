import { ReactNode } from 'react';
import { Button } from '../components/ui/button';

const navLinks = [
  { href: '/kitchen', label: 'Kitchen' },
  { href: '/bar', label: 'Bar' },
  { href: '/foh', label: 'FOH' },
  { href: '/owner', label: 'Owner' },
];

type StaffLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;

  // Optional content shown on the right side of the header (e.g. legend, manager buttons)
  headerRight?: ReactNode;

  hideNav?: boolean;
  hideHeader?: boolean;
  fullBleed?: boolean;
};

export const StaffLayout = ({
  title,
  subtitle,
  children,
  headerRight,
  hideNav,
  hideHeader,
  fullBleed,
}: StaffLayoutProps) => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  return (
    <div className={fullBleed ? "h-[100dvh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100" : "min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100"}>
      <div className={fullBleed ? "w-screen h-screen overflow-hidden" : "max-w-6xl mx-auto px-4 py-8 space-y-6"}>
        {!hideHeader && (
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                Staff
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>

            {(headerRight || !hideNav) && (
              <div className="flex flex-wrap items-center gap-2">
                {headerRight && (
                  <div className="flex flex-wrap items-center gap-2">{headerRight}</div>
                )}

                {!hideNav && (
                  <div className="flex flex-wrap gap-2">
                    {navLinks.map((link) => {
                      const isActive = path === link.href;
                      return (
                        <Button
                          key={link.href}
                          asChild
                          variant={isActive ? 'default' : 'outline'}
                          className={isActive ? 'shadow-md' : 'bg-white/70'}
                        >
                          <a href={link.href}>{link.label}</a>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </header>
        )}
        <div className={fullBleed ? "h-full w-full" : "space-y-4"}>{children}</div>
      </div>
    </div>
  );
};
