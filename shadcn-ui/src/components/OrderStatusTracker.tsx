// src/components/OrderStatusTracker.tsx
import { useEffect, useState } from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Card } from './ui/card';
import { CheckCircle2, Clock, ChefHat, Package, Truck } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'PICKING_UP' | 'DELIVERED';

type OrderStatusTrackerProps = {
  orderId: string;
  language: Language;
  isToGo?: boolean;
  onStatusChange?: (status: OrderStatus) => void;
};

const STATUS_STEPS: { status: OrderStatus; icon: typeof Clock; labelKey: string }[] = [
  { status: 'NEW', icon: Clock, labelKey: 'orderReceived' },
  { status: 'IN_PROGRESS', icon: ChefHat, labelKey: 'preparing' },
  { status: 'READY', icon: Package, labelKey: 'ready' },
  { status: 'PICKING_UP', icon: Truck, labelKey: 'pickingUp' },
  { status: 'DELIVERED', icon: CheckCircle2, labelKey: 'delivered' },
];

/**
 * Live Order Status Tracker
 * 
 * Displays real-time order status updates with visual progress indicator.
 * Subscribes to order changes and shows notifications when status changes.
 */
export function OrderStatusTracker({
  orderId,
  language,
  isToGo = false,
  onStatusChange,
}: OrderStatusTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('NEW');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Fetch initial status
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('[OrderStatusTracker] Error fetching order status:', error);
        return;
      }

      if (data) {
        setCurrentStatus(data.status as OrderStatus);
        setLastUpdate(new Date());
      }
    };

    fetchStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: OrderStatus }).status;
          if (newStatus !== currentStatus) {
            setCurrentStatus(newStatus);
            setLastUpdate(new Date());
            setShowNotification(true);
            onStatusChange?.(newStatus);

            // Hide notification after 3 seconds
            setTimeout(() => setShowNotification(false), 3000);

            // Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(t('orderStatusUpdated', language), {
                body: t(STATUS_STEPS.find(s => s.status === newStatus)?.labelKey || 'orderReceived', language),
                icon: '/images/OrderStatus.jpg',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, currentStatus, language, onStatusChange]);

  const currentStepIndex = STATUS_STEPS.findIndex(step => step.status === currentStatus);

  return (
    <div className="space-y-4">
      {/* Status Notification */}
      {showNotification && (
        <Card className="p-4 bg-green-50 border-green-200 animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">
                {t('orderStatusUpdated', language)}
              </p>
              <p className="text-sm text-green-700">
                {t(STATUS_STEPS[currentStepIndex]?.labelKey || 'orderReceived', language)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Tracker */}
      <Card className="p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isToGo ? t('toGoOrderStatus', language) : t('orderStatus', language)}
            </h3>
            <span className="text-xs text-gray-500">
              {t('lastUpdated', language)}: {lastUpdate.toLocaleTimeString(language)}
            </span>
          </div>

          {/* Status Steps */}
          <div className="space-y-3">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <p
                      className={cn(
                        'font-medium transition-colors',
                        isCompleted ? 'text-gray-900' : 'text-gray-400',
                        isCurrent && 'text-green-600 font-semibold'
                      )}
                    >
                      {t(step.labelKey, language)}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-gray-500">
                        {t('inProgress', language)}...
                      </p>
                    )}
                  </div>

                  {/* Checkmark */}
                  {isCompleted && !isCurrent && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Estimated Time (for to-go orders) */}
          {isToGo && currentStatus !== 'DELIVERED' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <Clock className="w-4 h-4 inline mr-2" />
                {currentStatus === 'READY'
                  ? t('readyForPickup', language)
                  : t('estimatedTime', language) + ': 15-20 ' + t('minutes', language)}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}