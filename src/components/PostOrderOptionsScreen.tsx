import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black p-6 flex items-center justify-center text-white">
      <Card className="w-full max-w-md p-6 space-y-4 bg-white/5 border-white/20 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">
          {t('postOrderPrompt', language)}
        </p>
        <h1 className="text-2xl font-semibold text-white">
          {t('postOrderHeading', language)}
        </h1>
        <p className="text-white/80 text-sm">
          {t('postOrderDescription', language)}
        </p>
        <div className="space-y-3 pt-4">
          <Button className="w-full" onClick={onGoToMenu}>
            {t('postOrderGoToMenu', language)}
          </Button>
          <Button variant="outline" className="w-full text-white border-white/40" onClick={onRequestBill}>
            {t('postOrderRequestBill', language)}
          </Button>
        </div>
      </Card>
    </div>
  );
}
