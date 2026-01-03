import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface PostOrderOptionsScreenProps {
  language: Language;
  onGoToMenu: () => void;
  onRequestBill: () => void;
}

export function PostOrderOptionsScreen({
  language,
  onGoToMenu,
  onRequestBill,
}: PostOrderOptionsScreenProps) {
  return (
    <>
      <PageShell paddedForActionBar>
        <Card className="w-full p-6 space-y-4 text-center shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            {t('postOrderPrompt', language)}
          </p>
          <h1 className="text-xl font-semibold text-gray-900">
            {t('postOrderHeading', language)}
          </h1>
          <p className="text-sm text-gray-600">
            {t('postOrderDescription', language)}
          </p>
        </Card>
      </PageShell>

      <BottomActionBar>
        <Button className="w-full sm:flex-1" onClick={onGoToMenu} size="lg">
          {t('postOrderGoToMenu', language)}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:flex-1"
          onClick={onRequestBill}
          size="lg"
        >
          {t('postOrderRequestBill', language)}
        </Button>
      </BottomActionBar>
    </>
  );
}
