import { Info, Smartphone } from 'lucide-react';
import { Card } from './ui/card';

export function DemoInfoCard() {
  return (
    <Card className="m-4 p-4 bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <h3 className="font-semibold text-blue-900">Demo Restaurant QR App</h3>
          <p className="text-sm text-blue-800">
            This is a demonstration of a restaurant QR code ordering system. In a real implementation, 
            you would scan an actual QR code at your table.
          </p>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <Smartphone className="w-4 h-4" />
            <span>Click "Simulate QR Scan" to begin the demo experience</span>
          </div>
        </div>
      </div>
    </Card>
  );
}