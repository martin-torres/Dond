import { useMemo, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

type Props = {
  children: React.ReactNode;
};

export function ManagerGate({ children }: Props) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  const expectedPin = useMemo(() => {
    // For now: reads PIN from URL (?pin=1234) or defaults to 1234.
    // Next step we can move it to Supabase / real auth.
    if (typeof window === 'undefined') return '1234';
    const params = new URLSearchParams(window.location.search);
    return params.get('pin') ?? '1234';
  }, []);

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md p-6 space-y-4 border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Management Lock</p>
          <h1 className="text-xl font-semibold text-gray-900">Enter PIN</h1>
          <p className="text-sm text-gray-600">
            This area can change tables and floor plan.
          </p>
        </div>

        <input
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError('');
          }}
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button
            className="w-full"
            onClick={() => {
              if (pin === expectedPin) {
                sessionStorage.setItem('managerUnlocked', '1');
                setUnlocked(true);
                return;
              }
              setError('Wrong PIN');
            }}
          >
            Unlock
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            Back
          </Button>
        </div>

        <p className="text-xs text-gray-400">
          Dev note: change PIN using <code>?pin=1234</code> in the URL (temporary).
        </p>
      </Card>
    </div>
  );
}
