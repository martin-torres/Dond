import React from 'react';
import { X, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface RightSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

// Default right sidebar content for different contexts
interface ContextItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description?: string;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DefaultRightSidebarProps extends RightSidebarProps {
  context?: 'overview' | 'restaurant' | 'analytics' | 'communications' | 'system';
  contextData?: unknown;
}

// Icon mapping for different types
const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertTriangle
};

const typeColors = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  success: 'text-green-500',
  error: 'text-red-500'
};

function ContextItem({ item }: { item: ContextItem }) {
  const Icon = typeIcons[item.type];

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <Icon className={`h-4 w-4 mt-0.5 ${typeColors[item.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
          {item.timestamp && (
            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
        {item.action && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-6 text-xs"
            onClick={item.action.onClick}
          >
            {item.action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Default content based on context
function getDefaultContent(context: string, data?: unknown): ContextItem[] {
  switch (context) {
    case 'overview':
      return [
        {
          id: 'system-health',
          type: 'success',
          title: 'System Health',
          description: 'All systems are operating normally. No critical issues detected.',
          timestamp: '2 min ago'
        },
        {
          id: 'pending-imports',
          type: 'info',
          title: 'Data Imports',
          description: '2 import jobs are currently processing. Check the Data Import Center for details.',
          timestamp: '5 min ago'
        },
        {
          id: 'restaurant-sync',
          type: 'warning',
          title: 'Restaurant Sync',
          description: '3 restaurants have pending menu updates. Consider syncing their data.',
          timestamp: '1 hour ago',
          action: {
            label: 'Sync Now',
            onClick: () => console.log('Sync restaurants')
          }
        }
      ];

    case 'communications':
      return [
        {
          id: 'unread-messages',
          type: 'warning',
          title: 'Unread Messages',
          description: 'You have 3 unread messages from restaurants requiring attention.',
          timestamp: '10 min ago',
          action: {
            label: 'View Messages',
            onClick: () => console.log('View messages')
          }
        },
        {
          id: 'broadcast-status',
          type: 'info',
          title: 'Broadcast Status',
          description: 'Your last broadcast message was sent to 12 restaurants successfully.',
          timestamp: '2 hours ago'
        }
      ];

    case 'analytics':
      return [
        {
          id: 'performance-alert',
          type: 'warning',
          title: 'Performance Alert',
          description: 'Order processing time has increased by 15% in the last hour.',
          timestamp: '30 min ago',
          action: {
            label: 'Investigate',
            onClick: () => console.log('Investigate performance')
          }
        },
        {
          id: 'peak-hours',
          type: 'info',
          title: 'Peak Hours Analysis',
          description: 'Current peak hours detected: 7-9 PM. System performance is optimal.',
          timestamp: '1 hour ago'
        }
      ];

    default:
      return [
        {
          id: 'welcome',
          type: 'info',
          title: 'Welcome to Creator Admin',
          description: 'Select an item from the main area to view details here.',
          timestamp: 'Just now'
        }
      ];
  }
}

export default function RightSidebar({
  isOpen = true,
  onClose,
  title = "Details Panel",
  children,
  className = '',
  context,
  contextData,
  ...props
}: DefaultRightSidebarProps) {
  const defaultItems = context ? getDefaultContent(context, contextData) : [];

  return (
    <div className={`w-80 bg-card border-l border-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          {context && (
            <Badge variant="outline" className="text-xs">
              {context.replace('-', ' ')}
            </Badge>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {children ? (
            children
          ) : (
            <div className="space-y-4">
              {defaultItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ContextItem item={item} />
                  {index < defaultItems.length - 1 && <Separator />}
                </React.Fragment>
              ))}

              {defaultItems.length === 0 && (
                <div className="text-center py-8">
                  <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No additional information available
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Auto-refresh: ON</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

// Specialized sidebar for restaurant details
export function RestaurantDetailsSidebar({
  restaurant,
  onClose
}: {
  restaurant?: unknown;
  onClose?: () => void;
}) {
  return (
    <RightSidebar
      title="Restaurant Details"
      onClose={onClose}
      context="restaurant"
    >
      {restaurant ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{restaurant.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      restaurant.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span>{restaurant.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tables</span>
                  <div className="font-medium mt-1">{restaurant.table_count || 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Orders Today</span>
                  <div className="font-medium mt-1">{restaurant.today_orders || 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue</span>
                  <div className="font-medium mt-1">${restaurant.today_revenue || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                View Full Details
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                Edit Settings
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                Send Message
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Select a restaurant to view details
          </p>
        </div>
      )}
    </RightSidebar>
  );
}
