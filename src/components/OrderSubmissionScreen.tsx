import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';

interface OrderSubmissionScreenProps {
  language: Language;
  onContinue: () => void;
}

export function OrderSubmissionScreen({ language, onContinue }: OrderSubmissionScreenProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 pb-20">
      <div className="space-y-3 mt-12 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">
          {t('orderSubmitTitle', language)}
        </p>
        <h1 className="text-3xl font-semibold">
          {t('orderSubmitBody', language)}
        </h1>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onContinue}
          className="w-56 h-56 rounded-full border-8 border-[#d4c2a1] bg-[#f2e6cc] text-black text-lg shadow-2xl"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          {t('orderSubmitContinue', language)}
        </Button>
      </div>
    </div>
  );
}
