import { useMemo, useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { Card } from '../components/ui/card';
import { SeedTablesToSupabase } from './SeedTablesToSupabase';
import { ManagerTablesPanel } from './ManagerTablesPanel';
import { FloorPlanCanvasEditor } from './FloorPlanCanvasEditor';
import { SeedMenuToSupabase } from './SeedMenuToSupabase';

type EditSection = 'tables' | 'menu' | 'promos' | 'settings';

const sections: Array<{ id: EditSection; label: string }> = [
  { id: 'tables', label: 'Tables & Floor Plan' },
  { id: 'menu', label: 'Menu (Food & Drinks)' },
  { id: 'promos', label: 'Promos & Events' },
  { id: 'settings', label: 'Settings' },
];

export const ManagerEditConsole = () => {
  const managerUnlocked = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('managerUnlocked') === '1';
  }, []);

  const [active, setActive] = useState<EditSection>(() => {
    if (typeof window === 'undefined') return 'tables';
    const saved = sessionStorage.getItem('managerEditSection') as EditSection | null;
    return saved ?? 'tables';
  });
  // Manager Sidebar (Edit Console) collapse state (thin icon rail)
  const [consoleCollapsed, setConsoleCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true; // default collapsed
    const saved = localStorage.getItem('managerEditConsoleCollapsed');
    return saved === null ? true : saved === '1';
  });

  const toggleConsole = () => {
    setConsoleCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('managerEditConsoleCollapsed', next ? '1' : '0');
      }
      return next;
    });
  };

  const setSection = (next: EditSection) => {
    setActive(next);
    sessionStorage.setItem('managerEditSection', next);
  };

  if (!managerUnlocked) {
    return (
      <StaffLayout title="Manager edit" subtitle="Locked" hideNav>
        <Card className="p-4 border border-slate-200 shadow-sm">
          <p className="text-sm text-gray-600">Manager edit is locked. Go to /manager and unlock first.</p>
        </Card>
      </StaffLayout>
    );
  }
 
  return (
    <StaffLayout title="Manager edit" subtitle="Configuration changes (Supabase source of truth)" hideNav>
      <div className="manager-theme">
        <div
          className="grid gap-4 bg-background text-foreground"
          style={{ gridTemplateColumns: consoleCollapsed ? '64px 1fr' : '240px 1fr' }}
        >
        {/* Manager Sidebar (Edit Console) */}
        <Card className="border border-slate-200 shadow-sm h-[calc(100vh-160px)] overflow-hidden flex flex-col">
          <div className={`h-full w-full flex flex-col overflow-hidden ${consoleCollapsed ? 'p-2' : 'p-3'}`}>
            {/* Fixed header */}
            <div className={`flex items-center ${consoleCollapsed ? 'justify-center' : 'justify-between'} gap-2 mb-3 flex-shrink-0`}>
              {!consoleCollapsed && (
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Edit Console</div>
              )}

              <button
                type="button"
                onClick={toggleConsole}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                title={consoleCollapsed ? 'Expand edit console' : 'Collapse to icon rail'}
                aria-label={consoleCollapsed ? 'Expand edit console' : 'Collapse edit console'}
              >
                {consoleCollapsed ? '»' : '«'}
              </button>

              {!consoleCollapsed && (
                <a
                  href="/manager"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                  title="Back to operations"
                >
                  Back
                </a>
              )}
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {consoleCollapsed ? (
                  <div className="flex flex-col items-center gap-2">
                    {sections.map((s) => {
                      const isActive = active === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSection(s.id)}
                          className={`w-12 h-12 rounded-2xl border text-sm font-extrabold transition
                            ${isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'}
                          `}
                          title={s.label}
                          aria-label={s.label}
                        >
                          {s.label.trim().charAt(0).toUpperCase()}
                        </button>
                      );
                    })}

                    <a
                      href="/manager"
                      className="mt-2 w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-sm font-extrabold text-emerald-700 hover:bg-slate-50"
                      title="Back to operations"
                      aria-label="Back to operations"
                    >
                      ↩
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      {sections.map((s) => {
                        const isActive = active === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSection(s.id)}
                            className={`w-full text-left rounded-xl px-3 py-2 text-sm font-semibold transition
                              ${isActive ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-800'}
                            `}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 text-xs text-gray-500 leading-relaxed">
                      Changes made here write to Supabase and should propagate to all other screens by reload/subscription.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Right content */}
        <Card className="p-4 border border-slate-200 shadow-sm h-[calc(100vh-160px)] overflow-auto space-y-4">
          {active === 'tables' && (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Tables</p>
                <h2 className="text-xl font-semibold text-gray-900">Tables & Floor Plan</h2>
              </div>

              {/* These are the ONLY table-config writers */}
              {/* FloorPlanCanvasEditor: fixed height (800px) */}
              <div style={{ height: '800px', overflow: 'hidden' }}>
                <FloorPlanCanvasEditor
                  restaurantId={new URLSearchParams(window.location.search).get('restaurantId') ?? ''}
                />
              </div>

              {/* ManagerTablesPanel: fixed height (400px) */}
              <div style={{ height: '400px', overflow: 'auto' }}>
                <ManagerTablesPanel enabled />
              </div>

              <SeedTablesToSupabase enabled />
            </>
          )}

          {active === 'menu' && (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Menu</p>
                <h2 className="text-xl font-semibold text-gray-900">Food & Drinks</h2>
              </div>

              <SeedMenuToSupabase enabled />

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Menu</p>
                <h2 className="text-xl font-semibold text-gray-900">Food & Drinks</h2>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-700">
                  This will be the menu editor (items, descriptions, prices, availability, categories).
                </p>
              </div>
            </>
          )}

          {active === 'promos' && (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Promos</p>
                <h2 className="text-xl font-semibold text-gray-900">Promotions & Events</h2>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-700">
                  This will be promos/events editor (time-bound offers, banners, special menus).
                </p>
              </div>
            </>
          )}

          {active === 'settings' && (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Settings</p>
                <h2 className="text-xl font-semibold text-gray-900">Restaurant Settings</h2>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-700">
                  Later: taxes, service fee, printers, receipt settings, staff roles.
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
      </div>
    </StaffLayout>
  );
};
