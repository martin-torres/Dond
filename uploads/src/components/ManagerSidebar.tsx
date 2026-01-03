import { useState, useEffect } from 'react';
import { useSidebar } from './ui/sidebar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  LayoutDashboard,
  Utensils,
  Gift,
  Calendar,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';

type EditSection = 'tables' | 'menu' | 'promos' | 'settings';

const sections: Array<{ id: EditSection; label: string; icon: React.ReactNode }> = [
  { id: 'tables', label: 'Tables & Floor Plan', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'menu', label: 'Menu (Food & Drinks)', icon: <Utensils className="h-4 w-4" /> },
  { id: 'promos', label: 'Promos & Events', icon: <Gift className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

interface ManagerSidebarProps {
  activeSection: EditSection;
  onSectionChange: (section: EditSection) => void;
  restaurantId: string;
}

export const ManagerSidebar = ({ activeSection, onSectionChange, restaurantId }: ManagerSidebarProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('managerSidebarCollapsed');
    return saved === null ? true : saved === '1';
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('managerSidebarCollapsed', next ? '1' : '0');
    }
  };

  // Use Radix UI sidebar context for responsive behavior
  const sidebar = useSidebar();
  const isMobile = sidebar?.isMobile || false;

  useEffect(() => {
    // Sync with Radix sidebar state on mobile
    if (isMobile) {
      setCollapsed(!sidebar?.open);
    }
  }, [isMobile, sidebar?.open]);

  const handleSectionClick = (section: EditSection) => {
    onSectionChange(section);
    // On mobile, close sidebar after selection
    if (isMobile) {
      sidebar?.setOpen?.(false);
    }
  };

  return (
    <div className={`h-full flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <Card className="h-full border border-slate-200 bg-white shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-200">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Menu className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Edit Console</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="h-8 w-8"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Content Area with ScrollArea */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 text-sm font-medium ${
                    isActive 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => handleSectionClick(section.id)}
                >
                  {section.icon}
                  {!collapsed && section.label}
                </Button>
              );
            })}
          </div>

          {!collapsed && (
            <>
              <Separator className="my-3" />
              <div className="p-3 text-xs text-slate-500 leading-relaxed">
                Changes made here write to Supabase and should propagate to all other screens by reload/subscription.
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-slate-200">
          {!collapsed ? (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-sm"
              onClick={() => window.location.href = '/manager'}
            >
              <X className="h-4 w-4" />
              Back to Operations
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="w-full h-10"
              onClick={() => window.location.href = '/manager'}
              title="Back to operations"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
