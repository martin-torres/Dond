import { Button } from './ui/button';

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  onRequestItem: (requestType: 'server' | 'condiments' | 'water' | 'bill' | 'issue') => void;
}

export function RequestModal({ open, onClose, onRequestItem }: RequestModalProps) {
  const handleRequest = (requestType: 'server' | 'condiments' | 'water' | 'bill' | 'issue') => {
    onRequestItem(requestType);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Need assistance?</h2>
            <p className="text-sm text-gray-600 mt-1">Our team is here to help</p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-14 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-200 justify-start"
              onClick={() => handleRequest('server')}
            >
              <span className="text-lg">🔔</span>
              <div className="text-left">
                <div className="text-sm font-medium">Call Server</div>
                <div className="text-xs text-gray-500">Request server assistance</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 flex items-center gap-3 hover:bg-orange-50 hover:border-orange-200 justify-start"
              onClick={() => handleRequest('condiments')}
            >
              <span className="text-lg">🧂</span>
              <div className="text-left">
                <div className="text-sm font-medium">Salt/Condiments</div>
                <div className="text-xs text-gray-500">Request condiments</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 flex items-center gap-3 hover:bg-cyan-50 hover:border-cyan-200 justify-start"
              onClick={() => handleRequest('water')}
            >
              <span className="text-lg">💧</span>
              <div className="text-left">
                <div className="text-sm font-medium">Water/Refill</div>
                <div className="text-xs text-gray-500">Request water or drink refill</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 flex items-center gap-3 border-orange-200 text-orange-700 hover:bg-orange-50 justify-start"
              onClick={() => handleRequest('bill')}
            >
              <span className="text-lg">🧾</span>
              <div className="text-left">
                <div className="text-sm font-medium">Request Bill</div>
                <div className="text-xs text-orange-600">Ready to checkout</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 flex items-center gap-3 hover:bg-red-50 hover:border-red-200 justify-start"
              onClick={() => handleRequest('issue')}
            >
              <span className="text-lg">⚠️</span>
              <div className="text-left">
                <div className="text-sm font-medium">Report Issue</div>
                <div className="text-xs text-gray-500">Problem with order or service</div>
              </div>
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Our team will assist you shortly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
