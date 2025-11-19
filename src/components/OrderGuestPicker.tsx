import { Language } from '../types';
import { t } from '../utils/translations';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface OrderGuestPickerProps {
  seatingNames: string[];
  language: Language;
  onSelect: (index: number) => void;
  onCancel: () => void;
}

export function OrderGuestPicker({ seatingNames, language, onSelect, onCancel }: OrderGuestPickerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{t('orderGuestTitle', language)}</p>
          <h1 className="text-2xl font-semibold text-gray-900">{t('orderGuestSubtitle', language)}</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seatingNames.length === 0 && (
            <Card className="p-4 text-sm text-gray-500">
              No seats registered yet. Please add guests first.
            </Card>
          )}
          {seatingNames.map((name, index) => (
            <Card key={index} className="p-4 flex flex-col gap-2 border border-slate-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">
                {name?.trim() || `${t('seat', language)} ${index + 1}`}
              </p>
              <p className="text-xs text-gray-500">Tap to route this course to the correct seat.</p>
              <Button onClick={() => onSelect(index)} size="sm">
                {t('addToOrder', language)}
              </Button>
            </Card>
          ))}
        </div>

        <Button variant="ghost" onClick={onCancel} className="text-gray-600 hover:text-gray-900">
          {t('back', language)}
        </Button>
      </div>
    </div>
  );
}
