import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

interface TableLayoutProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
}

export default function TableLayout({ tables, onTableSelect }: TableLayoutProps) {
  const { t } = useLanguage();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleTableClick = (table: Table) => {
    if (table.isAvailable) {
      setSelectedTable(table);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedTable) {
      onTableSelect(selectedTable);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{t('tableLayout')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Responsive table layout container */}
        <div className="relative bg-gray-50 rounded-lg p-2 sm:p-4 mb-4 w-full overflow-hidden" 
             style={{ 
               height: 'clamp(250px, 40vh, 400px)',
               minHeight: '250px'
             }}>
          {/* Restaurant layout background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg"></div>
          
          {/* Responsive Tables Grid */}
          <div className="relative w-full h-full">
            {tables.map((table, index) => {
              // Calculate responsive positioning
              const row = Math.floor(index / 3);
              const col = index % 3;
              const leftPercent = (col * 33.33) + 5; // 5% margin
              const topPercent = (row * 40) + 10; // 10% margin
              
              return (
                <div
                  key={table.id}
                  className={`absolute cursor-pointer transition-all duration-200 rounded-lg border-2 flex items-center justify-center text-xs sm:text-sm font-medium ${
                    selectedTable?.id === table.id
                      ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-lg scale-105 z-10'
                      : table.isAvailable
                      ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105'
                      : 'border-red-400 bg-red-50 text-red-700 cursor-not-allowed opacity-75'
                  }`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: 'clamp(60px, 25%, 80px)',
                    height: 'clamp(50px, 20%, 70px)',
                  }}
                  onClick={() => handleTableClick(table)}
                >
                  <div className="text-center p-1">
                    <div className="font-bold text-xs sm:text-sm">#{table.number}</div>
                    <div className="text-xs">{table.seats}</div>
                    {!table.isAvailable && table.reservedAt && (
                      <div className="text-xs mt-1 hidden sm:block">{table.reservedAt}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded flex-shrink-0"></div>
            <span>{t('available')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded flex-shrink-0"></div>
            <span>{t('reserved')}</span>
          </div>
        </div>

        {/* Selected table info */}
        {selectedTable && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Table #{selectedTable.number} - {selectedTable.seats} seats
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              {t('selectTable')}
            </p>
            <Button onClick={handleConfirmSelection} className="w-full">
              {t('confirm')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}