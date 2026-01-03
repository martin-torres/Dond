import React from 'react';
import { Wifi, Database, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface BottomBarProps {
  status?: {
    api?: 'connected' | 'disconnected' | 'error';
    database?: 'connected' | 'disconnected' | 'error';
    lastUpdate?: string;
    notifications?: number;
  };
  className?: string;
}

export default function BottomBar({
  status = {},
  className = ''
}: BottomBarProps) {
  const {
    api = 'connected',
    database = 'connected',
    lastUpdate,
    notifications = 0
  } = status;

  // Status indicators
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className={`bg-card border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground ${className}`}>
      {/* Left side - Status indicators */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon('connected')}
          <span>Ready</span>
        </div>

        {lastUpdate && (
          <>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Last updated: {lastUpdate}</span>
            </div>
          </>
        )}

        {notifications > 0 && (
          <>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-3 w-3 text-orange-500" />
              <span>{notifications} notifications</span>
            </div>
          </>
        )}
      </div>

      {/* Right side - Connection status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Wifi className={`h-3 w-3 ${api === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
          <span>API: {getStatusText(api)}</span>
        </div>

        <span>•</span>

        <div className="flex items-center space-x-2">
          <Database className={`h-3 w-3 ${database === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
          <span>DB: {getStatusText(database)}</span>
        </div>
      </div>
    </div>
  );
}

// Hook for managing bottom bar status
export function useBottomBarStatus() {
  const [status, setStatus] = React.useState<BottomBarProps['status']>({
    api: 'connected',
    database: 'connected',
    lastUpdate: new Date().toLocaleTimeString(),
    notifications: 0
  });

  const updateStatus = React.useCallback((newStatus: Partial<BottomBarProps['status']>) => {
    setStatus(prev => ({
      ...prev,
      ...newStatus,
      lastUpdate: newStatus?.lastUpdate || prev?.lastUpdate
    }));
  }, []);

  // Auto-update lastUpdate every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    updateStatus
  };
}
