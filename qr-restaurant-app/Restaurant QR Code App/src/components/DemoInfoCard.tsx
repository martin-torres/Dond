import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function DemoInfoCard() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-gray-900 mb-2">Welcome to Restaurant QR Ordering</h2>
            <p className="text-gray-600 mb-3">
              This is a full-featured restaurant ordering app that works in multiple languages!
            </p>
          </div>
        </div>

        <div className="space-y-3 text-gray-700">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="mb-1">🌍 <strong>Language Detection</strong></p>
            <p className="text-gray-600">
              The app auto-detects your browser language. You can also manually switch using the dropdown in the top-right corner.
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="mb-1">📱 <strong>Complete Journey</strong></p>
            <p className="text-gray-600">
              1. Scan QR → 2. View restaurant info → 3. Select table → 4. Order drinks while waiting → 5. Order food → 6. Split bill → 7. Pay
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="mb-1">🎮 <strong>Demo Features</strong></p>
            <p className="text-gray-600">
              • Use the distance slider to simulate proximity warnings
              <br />• Use "Simulate Terminal Payment" to test bill splitting as others pay
            </p>
          </div>
        </div>

        <Button onClick={() => setIsVisible(false)} className="w-full mt-4">
          Get Started
        </Button>
      </Card>
    </div>
  );
}
