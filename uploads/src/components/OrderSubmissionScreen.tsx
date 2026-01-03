import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface OrderSubmissionScreenProps {
  language: Language;
  onContinue: () => void;
}

export function OrderSubmissionScreen({ language, onContinue }: OrderSubmissionScreenProps) {
  return (
    <>
      <PageShell paddedForActionBar>
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            {t('orderSubmitTitle', language)}
          </p>
          <h1 className="text-xl font-semibold text-gray-900">
            {t('orderSubmitBody', language)}
          </h1>
        </div>
      </PageShell>

      <BottomActionBar>
        <Button onClick={onContinue} className="w-full sm:flex-1" size="lg">
          {t('orderSubmitTitle', language)}
        </Button>
      </BottomActionBar>
    </>
  );
}
