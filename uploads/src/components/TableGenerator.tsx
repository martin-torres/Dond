import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { RotateCcw, RotateCw, Plus, Save, Trash2 } from 'lucide-react';

type TableShape = 'circle' | 'square' | 'rectangle' | 'half-circle';

interface TableConfig {
  shape: TableShape;
  width: number;
  height: number;
  rotation: number;
  color: string;
}

interface PlacedTable extends TableConfig {
  id: string;
  x: number;
  y: number;
  name: string;
}

interface TableGeneratorProps {
  onAddTable: (table: PlacedTable) => void;
  onDeleteTable: (id: string) => void;
  placedTables: PlacedTable[];
  canvasWidth: number;
  canvasHeight: number;
}

export const TableGenerator: React.FC<TableGeneratorProps> = ({
  onAddTable,
  onDeleteTable,
  placedTables,
  canvasWidth,
  canvasHeight,
}) => {
  const [config, setConfig] = useState<TableConfig>({
    shape: 'circle',
    width: 60,
    height: 60,
    rotation: 0,
    color: '#3b82f6',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [ghostTable, setGhostTable] = useState<{ x: number; y: number } | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle shape selection
  const handleShapeChange = (shape: TableShape) => {
    setConfig(prev => ({
      ...prev,
      shape,
      width: shape === 'circle' ? 60 : (shape === 'rectangle' ? 100 : 60),
      height: shape === 'circle' ? 60 : (shape === 'rectangle' ? 60 : 60),
    }));
  };

  // Handle position updates
  const handlePositionUpdate = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ensure coordinates are within canvas bounds
    const boundedX = Math.max(0, Math.min(x, canvasWidth));
    const boundedY = Math.max(0, Math.min(y, canvasHeight));

    setGhostTable({ x: boundedX, y: boundedY });
    
    console.log('Ghost table position updated:', { x: boundedX, y: boundedY });
  };

  // Place the ghost table
  const handlePlaceTable = () => {
    console.log('handlePlaceTable called');
    console.log('Current ghostTable state:', ghostTable);
    console.log('Current config:', config);

    if (!ghostTable) {
      console.log('No ghost table to place - ghostTable is null');
      return;
    }

    console.log('Placing table at coordinates:', ghostTable);

    const newTable: PlacedTable = {
      id: `table-${Date.now()}`,
      name: `Table ${placedTables.length + 1}`,
      x: Math.round(ghostTable.x),
      y: Math.round(ghostTable.y),
      ...config,
    };

    console.log('Creating new table:', newTable);

    try {
      onAddTable(newTable);
      console.log('onAddTable called successfully');
      setGhostTable(null);
      console.log('Ghost table cleared');
    } catch (error) {
      console.error('Error placing table:', error);
    }
  };

  // Delete selected table
  const handleDeleteTable = () => {
    if (selectedTableId) {
      onDeleteTable(selectedTableId);
      setSelectedTableId(null);
    }
  };

  // Update table position when dragging existing table
  const handleTableDrag = (id: string, e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update the specific table
    const updatedTables = placedTables.map(table => 
      table.id === id 
        ? { ...table, x: Math.round(x), y: Math.round(y) }
        : table
    );
    
    // This would need to be handled by parent state management
    console.log('Drag update for table:', id, { x: Math.round(x), y: Math.round(y) });
  };

  return (
    <div className="space-y-4">
      {/* Controls Panel */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shape Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Table Shape</Label>
            <div className="flex gap-2">
              {(['circle', 'square', 'rectangle', 'half-circle'] as TableShape[]).map(shape => (
                <Button
                  key={shape}
                  variant={config.shape === shape ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleShapeChange(shape)}
                  className="flex-1"
                >
                  {shape === 'circle' && '⚪'}
                  {shape === 'square' && '⬜'}
                  {shape === 'rectangle' && '▭'}
                  {shape === 'half-circle' && '◜'}
                  <span className="ml-2 capitalize">{shape}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Size Controls */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Table Size</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Width</span>
                <span className="text-xs font-mono">{config.width}px</span>
              </div>
              <Slider
                value={[config.width]}
                onValueChange={([width]) => setConfig(prev => ({ ...prev, width, height: config.shape === 'circle' ? width : prev.height }))}
                min={30}
                max={200}
                step={5}
              />
              {config.shape !== 'circle' && (
                <>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">Height</span>
                    <span className="text-xs font-mono">{config.height}px</span>
                  </div>
                  <Slider
                    value={[config.height]}
                    onValueChange={([height]) => setConfig(prev => ({ ...prev, height }))}
                    min={30}
                    max={200}
                    step={5}
                  />
                </>
              )}
            </div>
          </div>

          {/* Rotation Controls */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Rotation</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, rotation: prev.rotation - 15 }))}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Rotate Left
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, rotation: prev.rotation + 15 }))}
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Rotate Right
              </Button>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Current: {config.rotation}°
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Table Color</Label>
            <div className="flex gap-2">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                <Button
                  key={color}
                  variant={config.color === color ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, color }))}
                  style={{ backgroundColor: color }}
                  className="w-8 h-8 p-0 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handlePlaceTable}
            disabled={!ghostTable}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Place Table
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteTable}
            disabled={!selectedTableId}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </Button>
        </div>
      </Card>

      {/* Canvas with Ghost Table */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Floor Plan Editor</h3>
            <div className="text-sm text-gray-600">
              {ghostTable && `Position: (${ghostTable.x}, ${ghostTable.y})`}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Drag the ghost table to position it, then click "Place Table" to add it to the floor plan.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
          style={{ width: canvasWidth, height: canvasHeight }}
          onMouseMove={handlePositionUpdate}
          onMouseLeave={() => setGhostTable(null)}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(148,163,184,0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148,163,184,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Ghost Table */}
          {ghostTable && (
            <div
              className="absolute border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 rounded-lg cursor-move"
              style={{
                left: ghostTable.x - (config.shape === 'circle' ? config.width / 2 : config.width / 2),
                top: ghostTable.y - (config.shape === 'circle' ? config.height / 2 : config.height / 2),
                width: config.width,
                height: config.height,
                transform: `rotate(${config.rotation}deg)`,
                borderRadius: config.shape === 'circle' ? '50%' : config.shape === 'half-circle' ? '50% 50% 0 0' : '8px',
              }}
            >
              <div className="absolute top-1 left-1 text-xs text-blue-600 font-mono">
                Ghost
              </div>
              <div className="absolute bottom-1 right-1">
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Place button clicked, calling handlePlaceTable');
                    handlePlaceTable();
                  }}
                  className="text-xs"
                >
                  Place Table
                </Button>
              </div>
            </div>
          )}

          {/* Placed Tables */}
          {placedTables.map(table => (
            <div
              key={table.id}
              className={`absolute border-2 cursor-pointer transition-all ${
                selectedTableId === table.id ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-400'
              }`}
              style={{
                left: table.x - (table.shape === 'circle' ? table.width / 2 : table.width / 2),
                top: table.y - (table.shape === 'circle' ? table.height / 2 : table.height / 2),
                width: table.width,
                height: table.height,
                transform: `rotate(${table.rotation}deg)`,
                borderRadius: table.shape === 'circle' ? '50%' : table.shape === 'half-circle' ? '50% 50% 0 0' : '8px',
                backgroundColor: table.color,
                opacity: 0.8,
              }}
              onClick={() => setSelectedTableId(table.id)}
              onMouseDown={(e) => {
                e.stopPropagation();
                // Start dragging existing table
                setIsDragging(true);
              }}
            >
              <div className="absolute top-1 left-1 text-xs text-white font-semibold text-center w-full">
                {table.name}
              </div>
              <div className="absolute bottom-1 right-1 text-xs text-white font-mono opacity-80">
                ({table.x}, {table.y})
              </div>
            </div>
          ))}

          {/* Instructions */}
          {!ghostTable && placedTables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a shape and drag to create your first table</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table List */}
      {placedTables.length > 0 && (
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-2">Placed Tables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {placedTables.map(table => (
              <div
                key={table.id}
                className={`p-2 border rounded cursor-pointer ${
                  selectedTableId === table.id ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedTableId(table.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-sm">{table.name}</span>
                    <div className="text-xs text-gray-600">
                      {table.shape} • {table.width}×{table.height}px • {table.rotation}°
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: table.color }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Position: ({table.x}, {table.y})
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
