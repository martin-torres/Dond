import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { Table, Language } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface TableSelectorProps {
  tables: Table[];
  language: Language;
  onSelectTable: (tableId: string | null) => void;
}

export function TableSelector({ tables, language, onSelectTable }: TableSelectorProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const locations = [
    { id: 'all', label: 'All', icon: '🏛️' },
    { id: 'patio', label: t('patio', language), icon: '🌿' },
    { id: 'window', label: t('window', language), icon: '🪟' },
    { id: 'balcony', label: t('balcony', language), icon: '🏰' },
    { id: 'middle', label: t('middle', language), icon: '🍽️' },
  ];

  const filteredTables = selectedLocation === 'all' 
    ? tables 
    : tables.filter(t => t.location === selectedLocation);

  const handleTableClick = (table: Table) => {
    if (table.available) {
      setSelectedTable(table.id);
    }
  };

  const handleConfirm = () => {
    onSelectTable(selectedTable);
  };

  const handleNextAvailable = () => {
    const nextTable = tables.find(t => t.available);
    if (nextTable) {
      onSelectTable(nextTable.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('selectTable', language)}</h1>
        </div>

        {/* Location Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {locations.map((loc) => (
            <Button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              variant={selectedLocation === loc.id ? 'default' : 'outline'}
              className={`flex-shrink-0 ${selectedLocation === loc.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
            >
              <span className="mr-2">{loc.icon}</span>
              {loc.label}
            </Button>
          ))}
        </div>

        {/* Visual Table Layout */}
        <Card className="p-6">
          <div className="relative w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border-2 border-slate-300 overflow-hidden">
            {filteredTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                disabled={!table.available}
                className={`absolute w-16 h-16 rounded-lg flex flex-col items-center justify-center transition-all transform hover:scale-110 text-xs font-medium ${
                  table.available
                    ? selectedTable === table.id
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-110'
                      : table.reserved
                      ? 'bg-yellow-100 border-2 border-yellow-500 text-yellow-800 hover:border-yellow-600'
                      : 'bg-white border-2 border-green-500 text-gray-900 hover:border-green-600 shadow-md'
                    : 'bg-red-100 border-2 border-red-400 text-red-600 cursor-not-allowed opacity-60'
                }`}
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  transform: `translate(-50%, -50%) ${selectedTable === table.id ? 'scale(1.1)' : ''}`,
                }}
              >
                {selectedTable === table.id && (
                  <Check className="w-5 h-5 mb-1" />
                )}
                {table.reserved && table.available && selectedTable !== table.id && (
                  <Clock className="w-4 h-4 mb-0.5" />
                )}
                <span className="font-bold">#{table.number}</span>
                <span className="text-xs">{table.seats}</span>
              </button>
            ))}
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3 bg-white/90 backdrop-blur-sm p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-xs text-gray-700">{t('available', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded" />
                <span className="text-xs text-gray-700">{t('reserved', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded" />
                <span className="text-xs text-gray-700">{t('occupied', language)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Table List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              disabled={!table.available}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                table.available
                  ? selectedTable === table.id
                    ? 'border-green-600 bg-green-50'
                    : table.reserved
                    ? 'border-yellow-400 bg-yellow-50 hover:border-yellow-500'
                    : 'border-gray-200 bg-white hover:border-green-400 hover:shadow-md'
                  : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Table #{table.number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {table.seats} {t('seats', language)} • {t(table.location, language)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      table.available 
                        ? table.reserved 
                          ? 'outline' 
                          : 'default' 
                        : 'destructive'
                    }
                    className={
                      table.reserved && table.available 
                        ? 'border-yellow-500 text-yellow-700 bg-yellow-50' 
                        : ''
                    }
                  >
                    {table.available 
                      ? table.reserved 
                        ? t('reserved', language) 
                        : t('available', language) 
                      : t('occupied', language)}
                  </Badge>
                  {table.reserved && table.available && (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto space-y-2">
            <Button 
              onClick={handleConfirm} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
              size="lg"
              disabled={!selectedTable}
            >
              {t('confirmTable', language)}
            </Button>
            <Button 
              onClick={handleNextAvailable} 
              className="w-full" 
              variant="outline"
              size="lg"
            >
              {t('nextAvailable', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}