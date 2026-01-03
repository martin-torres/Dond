import { PartyPopper } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface TableReadyScreenProps {
  language: Language;
  tableNumber: number;
  onProceed: () => void;
}

export function TableReadyScreen({ language, tableNumber, onProceed }: TableReadyScreenProps) {
  return (
    <>
      <PageShell
        paddedForActionBar
        headerSlot={
          <div className="max-w-md w-full text-center space-y-6 mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <PartyPopper className="w-16 h-16 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-gray-900">{t('tableReady', language)}</h1>
              <p className="text-sm text-gray-600">Table #{tableNumber}</p>
            </div>
          </div>
        }
      >
        <></>
      </PageShell>

      <BottomActionBar>
        <Button onClick={onProceed} size="lg" className="w-full sm:flex-1">
          {t('orderFood', language)}
        </Button>
      </BottomActionBar>
    </>
  );
}
