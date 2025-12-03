import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Table, Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';
import FloorPlanTablePicker from './FloorPlanTablePicker';
import { StageGraphicSlot } from './StageGraphicSlot';

interface TableSelectorProps {
  tables: Table[];
  language: Language;
  onSelectTable: (tableId: string | null) => void;
}

export function TableSelector({ tables, language, onSelectTable }: TableSelectorProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

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

  const filteredTables =
    selectedLocation === 'all' ? tables : tables.filter((t) => t.location === selectedLocation);

  const handleTableClick = (table: Table) => {
    if (table.available) {
      setSelectedTable(table.id);
    }
  };

  const handleConfirm = () => {
    onSelectTable(selectedTable);
  };

  const handleNextAvailable = () => {
    const nextTable = tables.find((t) => t.available);
    if (nextTable) {
      onSelectTable(nextTable.id);
    }
  };

  return (
    <>
      <PageShell paddedForActionBar className="justify-start">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="w-20" aria-hidden />
            <StageGraphicSlot label={t('selectTable', language)} tone="mint">
              🪑
            </StageGraphicSlot>
            <div className="flex w-20 justify-end" aria-hidden />
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
                    variant={isActive ? 'default' : 'outline'}
                    className="flex-shrink-0 rounded-full px-4"
                  >
                    <span className="mr-2">{loc.icon}</span>
                    {loc.label}
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Visual Table Layout - NEW fixed floor plan */}
          <Card className="p-6 space-y-4 bg-white/85 border-white/60 shadow-lg backdrop-blur">
            <FloorPlanTablePicker
              tables={tables}
              language={language}
              selectedLocation={selectedLocation}
              selectedTableId={selectedTable}
              onTableClick={handleTableClick}
            />
          </Card>

          {/* Table List */}
          <Card className="p-4 space-y-4 bg-white/85 border-white/60 shadow-lg backdrop-blur">
            {filteredTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                disabled={!table.available}
                className={`w-full p-4 rounded-2xl border text-left transition shadow-sm ${
                  table.available
                    ? selectedTable === table.id
                      ? 'border-green-600 bg-green-50 ring-2 ring-green-200 shadow-[0_0_0_6px_rgba(74,222,128,0.25)]'
                      : table.reserved
                      ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                      : 'border-white/80 bg-white hover:border-green-200'
                    : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
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
        </div>
      </PageShell>

      <BottomActionBar>
        <Button
          onClick={handleConfirm}
          className="w-full sm:flex-1"
          size="lg"
          disabled={!selectedTable}
        >
          {t('confirmTable', language)}
        </Button>
        <Button
          onClick={handleNextAvailable}
          className="w-full sm:flex-1"
          variant="outline"
          size="lg"
        >
          {t('nextAvailable', language)}
        </Button>
      </BottomActionBar>
    </>
  );
}
