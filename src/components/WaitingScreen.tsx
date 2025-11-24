import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface WaitingScreenProps {
  language: Language;
  estimatedWaitTime: number;
  onTableReady: () => void;
  onOrderDrinks: () => void;
  onTimeUpdate?: (seconds: number) => void;
  distance?: number;
  onDistanceChange?: (distance: number) => void;
}

export function WaitingScreen({
  language,
  estimatedWaitTime,
  onTableReady,
  onOrderDrinks,
  onTimeUpdate,
  distance,
  onDistanceChange,
}: WaitingScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(estimatedWaitTime);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTimeRemaining(estimatedWaitTime);
    setProgress(0);
    onTimeUpdate?.(estimatedWaitTime);
  }, [estimatedWaitTime, onTimeUpdate]);

  useEffect(() => {
    if (estimatedWaitTime <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onTableReady(), 500);
          onTimeUpdate?.(0);
          return 0;
        }
        const next = prev - 1;
        onTimeUpdate?.(next);
        return next;
      });
      setProgress(prev => Math.min(prev + (100 / estimatedWaitTime), 100));
    }, 1000);

    return () => clearInterval(interval);
  }, [estimatedWaitTime, onTableReady, onTimeUpdate]);

  const minutesDisplay = Math.floor(timeRemaining / 60);
  const secondsDisplay = timeRemaining % 60;

  return (
    <>
      <PageShell paddedForActionBar={timeRemaining > 0}>
        <div className="space-y-6">
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {timeRemaining === 0 ? (
                  <CheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <Clock className="w-12 h-12 text-white animate-pulse" />
                )}
              </div>

              {timeRemaining === 0 ? (
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">{t('tableReady', language)}</h2>
                  <p className="text-sm text-gray-600">{t('proceedToTable', language)}</p>
                </div>
              ) : (
                <div className="text-center space-y-4 w-full">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {minutesDisplay}m {secondsDisplay}s
                  </h2>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">{t('waitTime', language)}</p>
                </div>
              )}
            </div>
          </Card>

          {timeRemaining > 0 && distance !== undefined && onDistanceChange && (
            <Card className="p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Distance Demo — DEV MODE</p>
              <input
                type="range"
                min={0}
                max={100}
                value={distance}
                onChange={(event) => onDistanceChange(Number(event.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-600">{distance}m</p>
            </Card>
          )}
        </div>
      </PageShell>

      {timeRemaining > 0 && (
        <BottomActionBar>
          <Button onClick={onOrderDrinks} variant="outline" className="w-full" size="lg">
            {t('orderDrinks', language)}
          </Button>
        </BottomActionBar>
      )}
    </>
  );
}
