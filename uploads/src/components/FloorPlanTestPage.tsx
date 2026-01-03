import { useState, useEffect } from 'react';
import { CoordinateFloorPlan } from './CoordinateFloorPlan';
import { TableGenerator } from './TableGenerator';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useStaffData } from '../staff/StaffDataProvider';
import { fetchRestaurantFloorPlan, type RestaurantFloorPlanRow } from '../api/restaurantFloorPlanApi';
import { fetchRestaurantTables, type RestaurantTableRow } from '../api/restaurantTablesApi';
import { upsertRestaurantTables } from '../api/restaurantTablesApi';

export const FloorPlanTestPage = () => {
  const [restaurantId, setRestaurantId] = useState('rest-one-maui');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeTableIds, setActiveTableIds] = useState<string[]>([]);
  const [placedTables, setPlacedTables] = useState<any[]>([]);
  const [floorPlan, setFloorPlan] = useState<RestaurantFloorPlanRow | null>(null);
  
  const staff = useStaffData();

  // Load existing tables and floor plan
  useEffect(() => {
    const loadFloorPlan = async () => {
      try {
        const plan = await fetchRestaurantFloorPlan(restaurantId);
        setFloorPlan(plan);
        
        const tables = await fetchRestaurantTables(restaurantId);
        // Convert to our format for the table generator
        const convertedTables = tables.map(t => ({
          id: t.id,
          name: t.display_name || `Table ${t.table_number}`,
          shape: 'rectangle', // default shape
          width: 60,
          height: 60,
          rotation: 0,
          color: '#3b82f6',
          x: t.x || 0,
          y: t.y || 0,
        }));
        setPlacedTables(convertedTables);
      } catch (error) {
        console.error('Failed to load floor plan:', error);
      }
    };

    if (restaurantId) {
      loadFloorPlan();
    }
  }, [restaurantId]);

  // Simulate table selection
  const handleTableSelect = (tableId: string) => {
    setSelectedTableId(tableId);
    console.log('Selected table:', tableId);
  };

  // Simulate making a table active (for ops mode testing)
  const toggleActiveTable = (tableId: string) => {
    setActiveTableIds(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  // Test different restaurant IDs
  const testRestaurantIds = [
    'rest-one-maui',
    'rest-two-maui', 
    'rest-three-maui',
    'rest-four-maui'
  ];

  // Handle adding a new table
  const handleAddTable = async (table: any) => {
    try {
      // Convert table to database format
      const dbTable = {
        id: table.id,
        restaurant_id: restaurantId,
        display_name: table.name,
        table_number: placedTables.length + 1,
        seats: 4, // default
        location: 'middle', // default
        section: 'dining', // default section
        available: true,
        visible_to_customers: true,
        x: table.x,
        y: table.y,
        shape: table.shape,
        rotation: table.rotation,
        is_interactive: true,
      };

      await upsertRestaurantTables([dbTable]);
      setPlacedTables(prev => [...prev, table]);
      console.log('Table saved to database:', table);
    } catch (error) {
      console.error('Failed to save table:', error);
    }
  };

  // Handle deleting a table
  const handleDeleteTable = async (tableId: string) => {
    try {
      // For now, just remove from local state
      // In a real implementation, you'd delete from database
      setPlacedTables(prev => prev.filter(t => t.id !== tableId));
      console.log('Table deleted:', tableId);
    } catch (error) {
      console.error('Failed to delete table:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Coordinate-Based Floor Plan Test</h1>
                <p className="text-gray-600">Test the new coordinate system before integration</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('/', '_blank')}
                  variant="outline"
                >
                  Open Main App
                </Button>
                <Button 
                  onClick={() => window.location.href = '/test-floor-plan'}
                  variant="default"
                >
                  Refresh Test
                </Button>
              </div>
            </div>

            {/* Restaurant Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantId">Restaurant ID</Label>
                <Input
                  id="restaurantId"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  placeholder="rest-one-maui"
                />
              </div>
              <div className="space-y-2">
                <Label>Quick Test Restaurants</Label>
                <div className="flex flex-wrap gap-2">
                  {testRestaurantIds.map(id => (
                    <Button
                      key={id}
                      variant={restaurantId === id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRestaurantId(id)}
                    >
                      {id}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Selected Table</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {selectedTableId ? (
                    <span className="font-mono text-sm">Table: {selectedTableId}</span>
                  ) : (
                    <span className="text-gray-500 text-sm">None selected</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Active Tables (Ops Mode)</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Count: {activeTableIds.length}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Test Controls */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Test Mode</Label>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSelectedTableId(null)}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </Button>
                <Button 
                  onClick={() => setActiveTableIds([])}
                  variant="outline"
                  size="sm"
                >
                  Clear Active
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Responsive Test</Label>
              <p className="text-sm text-gray-600">
                Resize browser window to test responsive scaling
              </p>
            </div>
            <div className="space-y-2">
              <Label>Coordinate Info</Label>
              <p className="text-sm text-gray-600">
                Tables show their x,y coordinates on hover
              </p>
            </div>
          </div>
        </Card>

        {/* Main Floor Plan Display */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Customer View (Coordinate-Based)</h2>
            <div className="text-sm text-gray-600">
              Restaurant: {restaurantId} • Selected: {selectedTableId || 'None'}
            </div>
          </div>
          
          <CoordinateFloorPlan
            restaurantId={restaurantId}
            title="Customer Floor Plan"
            selectedTableId={selectedTableId}
            onSelectTableId={handleTableSelect}
            onlyVisibleToCustomers={true}
            variant="customer"
            activeTableIds={activeTableIds}
          />
        </div>

        {/* Ops Mode Test */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Ops Mode (Staff View)</h2>
            <div className="text-sm text-gray-600">
              Active tables highlighted, inactive dimmed
            </div>
          </div>
          
          <CoordinateFloorPlan
            restaurantId={restaurantId}
            title="Staff Floor Plan (Ops Mode)"
            selectedTableId={selectedTableId}
            onSelectTableId={handleTableSelect}
            onlyVisibleToCustomers={false}
            variant="ops"
            activeTableIds={activeTableIds}
          />
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tables positioned at exact x,y coordinates</li>
                <li>• Responsive scaling with aspect ratio preservation</li>
                <li>• Grid overlay for coordinate visualization</li>
                <li>• Hover coordinates display</li>
                <li>• Customer vs Ops mode variants</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Testing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Test different restaurant IDs</li>
                <li>• Resize browser to test responsiveness</li>
                <li>• Click tables to test selection</li>
                <li>• Toggle active tables for ops mode</li>
                <li>• Verify coordinates match database</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Table Generator */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <h3 className="text-2xl font-semibold mb-4">Interactive Table Generator</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create and position tables interactively on the floor plan. Tables will be saved to your database.
          </p>
          
          <TableGenerator
            onAddTable={handleAddTable}
            onDeleteTable={handleDeleteTable}
            placedTables={placedTables}
            canvasWidth={floorPlan?.canvas_w || 400}
            canvasHeight={floorPlan?.canvas_h || 300}
          />
        </Card>

        {/* Database Info */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Database Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Floor Plan Settings:</span>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• grid_size: Coordinate grid spacing</li>
                <li>• canvas_w: Canvas width in pixels</li>
                <li>• canvas_h: Canvas height in pixels</li>
              </ul>
            </div>
            <div>
              <span className="font-medium">Table Coordinates:</span>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• x: Horizontal position (0 to canvas_w)</li>
                <li>• y: Vertical position (0 to canvas_h)</li>
                <li>• visible_to_customers: Filter flag</li>
              </ul>
            </div>
            <div>
              <span className="font-medium">Coordinate Conversion:</span>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• left% = (x / canvas_w) * 100</li>
                <li>• top% = (y / canvas_h) * 100</li>
                <li>• transform: translate(-50%, -50%)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
