import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Database, BarChart3, MessageSquare, Activity, Store } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  stats?: {
    total_restaurants?: number;
    pending_communications?: number;
    recent_imports?: number;
  };
}

export default function LeftSidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onTabChange,
  stats
}: LeftSidebarProps) {
  // Navigation items with enhanced data
  const navigationItems: NavigationItem[] = [
    {
      id: 'restaurants',
      label: 'Restaurants',
      icon: Store,
      badge: stats?.total_restaurants,
      description: 'Manage restaurant profiles and settings'
    },
    {
      id: 'data-import',
      label: 'Data Import',
      icon: Database,
      badge: stats?.recent_imports,
      description: 'Import data from spreadsheets and files'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View performance metrics and insights'
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: MessageSquare,
      badge: stats?.pending_communications,
      description: 'Send messages and announcements'
    },
    {
      id: 'system',
      label: 'System Status',
      icon: Activity,
      description: 'Monitor system health and logs'
    }
  ];

  return (
    <div className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="font-semibold text-sm">Creator Admin</h2>
            <p className="text-xs text-muted-foreground mt-1">Management Console</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-6 w-6 p-0 hover:bg-accent"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start h-auto py-2 px-3 transition-colors ${
                  isCollapsed ? 'px-2' : ''
                } ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} ${
                  isActive ? 'text-accent-foreground' : 'text-muted-foreground'
                }`} />

                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                        {item.label}
                      </span>
                      {item.badge && item.badge > 0 && (
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className="ml-2 h-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
