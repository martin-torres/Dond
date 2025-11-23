import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { Table, Language } from '../types';
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

  const locationLabelMap: Record<Table['location'], string> = {
    patio: t('patio', language),
    window: t('window', language),
    balcony: t('balcony', language),
    secondFloor: t('secondFloor', language),
    middle: t('middle', language),
  };

  const locations = [
    { id: 'all', label: t('allTables', language), icon: '🗺️' },
    { id: 'patio', label: locationLabelMap.patio, icon: '🌿' },
    { id: 'window', label: locationLabelMap.window, icon: '🪟' },
    { id: 'balcony', label: locationLabelMap.balcony, icon: '🏰' },
    { id: 'secondFloor', label: locationLabelMap.secondFloor, icon: '⬆️' },
    { id: 'middle', label: locationLabelMap.middle, icon: '🍽️' },
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            {t('selectTable', language)}
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">{t('seatSelectionTitle', language)}</h1>
          <p className="text-sm text-gray-600">{t('seatSelectionSubtitle', language)}</p>
        </div>

        {/* Location Filter */}
        <Card className="p-4 bg-white/80 border-white/60 shadow-sm backdrop-blur">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {locations.map((loc) => {
              const isActive = selectedLocation === loc.id;
              return (
                <Button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  variant="outline"
                  className={`flex-shrink-0 rounded-full px-4 ${
                    isActive
                      ? 'bg-white text-gray-900 border-gray-200 shadow-sm'
                      : 'bg-white/40 text-gray-600 border-transparent hover:bg-white/60'
                  }`}
                >
                  <span className="mr-2">{loc.icon}</span>
                  {loc.label}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Visual Table Layout */}
        <Card className="p-6 space-y-4 bg-white/85 border-white/60 shadow-lg backdrop-blur">
          <div className="relative w-full h-80 bg-gradient-to-br from-white via-indigo-50 to-purple-100 rounded-2xl border border-indigo-100 shadow-inner">
            {filteredTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                disabled={!table.available}
                className={`absolute w-16 h-16 rounded-lg flex flex-col items-center justify-center transition-all transform hover:scale-110 ${
                  table.available
                    ? selectedTable === table.id
                      ? 'bg-green-600 text-white shadow-lg scale-110'
                      : table.reserved
                      ? 'bg-yellow-100 border-2 border-yellow-500 text-gray-900 hover:border-yellow-600'
                      : 'bg-white border-2 border-green-500 text-gray-900 hover:border-green-600'
                    : 'bg-red-100 border-2 border-red-400 text-red-600 cursor-not-allowed opacity-60'
                }`}
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                }}
              >
                {selectedTable === table.id && (
                  <Check className="w-6 h-6 mb-1" />
                )}
                {table.reserved && table.available && selectedTable !== table.id && (
                  <Clock className="w-4 h-4 mb-0.5" />
                )}
                <span className="font-bold">#{table.number}</span>
                <span className="text-xs">{table.seats} {t('seats', language)}</span>
              </button>
            ))}
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3 bg-white/80 backdrop-blur p-3 rounded-xl border border-white/60">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-gray-700">{t('available', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded" />
                <span className="text-gray-700">{t('reserved', language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded" />
                <span className="text-gray-700">{t('occupied', language)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Table List */}
        <Card className="p-5 space-y-3 bg-white/85 border-white/60 shadow-lg backdrop-blur">
          {filteredTables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              disabled={!table.available}
              className={`w-full p-4 rounded-2xl border text-left transition ${
                table.available
                  ? selectedTable === table.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                    : table.reserved
                    ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                    : 'border-white/80 bg-white hover:border-indigo-200'
                  : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-gray-900 font-medium">
                    {t('selectTable', language)} #{table.number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {table.seats} {t('seats', language)} • {locationLabelMap[table.location]}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      table.available
                        ? table.reserved
                          ? 'outline'
                          : 'default'
                        : 'destructive'
                    }
                    className={`uppercase tracking-wide text-[10px] ${
                      table.reserved && table.available
                        ? 'border-amber-400 text-amber-700 bg-amber-50'
                        : table.available
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : ''
                    }`}
                  >
                    {table.available
                      ? table.reserved
                        ? t('reserved', language)
                        : t('available', language)
                      : t('occupied', language)}
                  </Badge>
                  {table.reserved && table.available && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </Card>

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto space-y-2">
            <Button 
              onClick={handleConfirm} 
              className="w-full" 
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
