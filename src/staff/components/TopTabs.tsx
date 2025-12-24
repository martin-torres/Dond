import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TabItem {
  id: string;
  label: string;
  badge?: number;
  disabled?: boolean;
}

interface TopTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TopTabs({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: TopTabsProps) {
  return (
    <div className={`bg-card border-b border-border ${className}`}>
      <ScrollArea>
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              disabled={tab.disabled}
              className={`rounded-none border-r border-border px-4 py-2 h-auto relative transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
              } ${
                tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
            >
              <span className="text-sm font-medium">{tab.label}</span>

              {/* Badge for notifications/counts */}
              {tab.badge && tab.badge > 0 && (
                <Badge
                  variant={activeTab === tab.id ? "secondary" : "outline"}
                  className="ml-2 h-5 px-1.5 text-xs"
                >
                  {tab.badge}
                </Badge>
              )}

              {/* Active tab indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground"></div>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Pre-configured tabs for the admin dashboard
export const adminDashboardTabs: TabItem[] = [
  { id: 'overview', label: 'Restaurants Overview' },
  { id: 'data-import-center', label: 'Data Import Center' },
  { id: 'analytics-insights', label: 'Analytics & Insights' },
  { id: 'fee-management', label: 'Fee Management' },
  { id: 'communications-hub', label: 'Communications Hub' },
  { id: 'system-config', label: 'System Configuration' }
];

// Hook for managing tab state
export function useTabState(initialTab: string = 'overview') {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  const handleTabChange = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
}
