import { CheckCircle, Clock, Package } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageShell } from './PageShell';

interface PickupNotificationScreenProps {
  language: Language;
  orderNumber: number;
  estimatedReadyTime?: string;
  onDismiss: () => void;
}

export function PickupNotificationScreen({
  language,
  orderNumber,
  estimatedReadyTime,
  onDismiss,
}: PickupNotificationScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md mx-auto bg-white shadow-2xl border-0">
          <PageShell>
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-green-600" />
                </div>
              </div>

              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('orderReadyTitle', language)}
                </h1>
                <p className="text-lg text-gray-600">
                  {t('orderReadySubtitle', language).replace('{number}', orderNumber.toString())}
                </p>
              </div>

              {/* Order Details */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {t('orderNumber', language)} #{orderNumber}
                  </span>
                </div>
                {estimatedReadyTime && (
                  <div className="flex items-center justify-center space-x-3 mt-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      {t('readyBy', language)} {estimatedReadyTime}
                    </span>
                  </div>
                )}
              </Card>

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {t('pickupInstructions', language)}
                </p>
                <p className="text-xs text-gray-500">
                  {t('pickupNote', language)}
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={onDismiss}
                className="w-full"
                size="lg"
              >
                {t('gotIt', language)}
              </Button>
            </div>
          </PageShell>
        </Card>
      </div>
    </div>
  );
}
