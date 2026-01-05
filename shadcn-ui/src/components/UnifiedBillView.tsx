// src/components/UnifiedBillView.tsx
import { useState, useMemo } from 'react';
import { Bill, Language, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2, AlertCircle, UserCog } from 'lucide-react';
import { cn } from '../lib/utils';

type UnifiedBillViewProps = {
  bill: Bill;
  language: Language;
  staffMode?: boolean; // Toggle staff management controls
  onRemoveItem?: (itemIndex: number) => void;
  onCompItem?: (itemIndex: number) => void;
  onManagerAssist?: () => void;
  className?: string;
};

/**
 * Unified Bill View Component
 * 
 * This is the SINGLE SOURCE OF TRUTH for bill display.
 * Both customer and staff see the exact same bill data.
 * 
 * Staff mode adds a management "sleeve" overlay with controls:
 * - Remove items
 * - Comp items  
 * - Manager assistance
 * 
 * The sleeve can be toggled on/off like 1-OP mode.
 */
export function UnifiedBillView({
  bill,
  language,
  staffMode = false,
  onRemoveItem,
  onCompItem,
  onManagerAssist,
  className,
}: UnifiedBillViewProps) {
  const [showStaffControls, setShowStaffControls] = useState(false);

  const taxRate = bill.subtotal > 0 ? bill.tax / bill.subtotal : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Staff Mode Toggle (only visible in staff mode) */}
      {staffMode && (
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-medium text-slate-700">
              {t('staffControls', language)}
            </span>
          </div>
          <Button
            variant={showStaffControls ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowStaffControls(!showStaffControls)}
          >
            {showStaffControls ? t('hide', language) : t('show', language)}
          </Button>
        </div>
      )}

      {/* Bill Summary Card */}
      <Card className="p-5 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('billSummary', language)}
        </h2>

        {/* Items List */}
        <ul className="space-y-2 text-base text-gray-700 max-h-96 overflow-y-auto">
          {bill.items.map((item, idx) => (
            <li
              key={idx}
              className={cn(
                'flex justify-between items-center px-2 py-3 rounded-lg transition-colors',
                showStaffControls && staffMode && 'bg-slate-50'
              )}
            >
              <div className="flex-1">
                <span className="font-medium text-base">
                  {item.quantity}× {item.menuItem.name[language] || item.menuItem.name.en}
                </span>
                {item.menuItem.description?.[language] && (
                  <p className="text-sm text-gray-500 mt-1">
                    {item.menuItem.description[language]}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-base">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </span>

                {/* Staff Controls Sleeve */}
                {staffMode && showStaffControls && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCompItem?.(idx)}
                      className="h-8 px-2"
                      title={t('compItem', language)}
                    >
                      <span className="text-xs">Comp</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveItem?.(idx)}
                      className="h-8 px-2"
                      title={t('removeItem', language)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="border-t pt-3 text-base space-y-2">
          <div className="flex justify-between">
            <span>{t('subtotal', language)}</span>
            <span>${bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('tax', language)}</span>
            <span>${bill.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('tip', language)}</span>
            <span>${bill.tip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 text-lg border-t">
            <span>{t('total', language)}</span>
            <span>${bill.total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Manager Assistance (Staff Mode Only) */}
      {staffMode && showStaffControls && onManagerAssist && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onManagerAssist}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          {t('requestManagerAssistance', language)}
        </Button>
      )}

      {/* Sync Status Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>{t('billSyncedRealtime', language)}</span>
      </div>
    </div>
  );
}