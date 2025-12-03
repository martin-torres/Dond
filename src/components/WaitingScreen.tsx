import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { PageShell } from './PageShell';

interface WaitingScreenProps {
  language: Language;
  estimatedWaitTime: number;
  onTableReady: () => void;
  onOrderDrinks: () => void;
  onTimeUpdate?: (seconds: number) => void;
  distance?: number;
  onDistanceChange?: (distance: number) => void;
  onBack?: () => void;
  onNext?: () => void;
}

export function WaitingScreen({
  language,
  estimatedWaitTime,
  onTableReady,
  onOrderDrinks,
  onTimeUpdate,
  distance,
  onDistanceChange,
  onBack,
  onNext,
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
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {onBack ? (
              <Button variant="ghost" onClick={onBack} className="text-gray-700 hover:text-gray-900">
                {t('back', language)}
              </Button>
            ) : (
              <span className="w-20" aria-hidden />
            )}
            <div className="rounded-full px-4 py-2 bg-white/70 backdrop-blur border border-white/70 shadow-sm text-xs font-semibold uppercase tracking-wide text-gray-700">
              {t('waitTime', language)}
            </div>
            {onNext ? (
              <Button variant="outline" onClick={onNext} className="text-gray-700">
                Next
              </Button>
            ) : (
              <span className="w-20" aria-hidden />
            )}
          </div>

          <Card className="relative p-8 overflow-hidden">
            <button
              onClick={onOrderDrinks}
              className="absolute top-4 left-4 w-56 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-lg p-4 text-left transition hover:border-indigo-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
            >
              <p className="text-xs font-semibold text-gray-700 mb-1">
                {t('orderDrinks', language)}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                A soft start while we prep your table.
              </p>
              <div className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700">
                <span>{t('orderDrinks', language)}</span>
              </div>
            </button>
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
    </>
  );
}
