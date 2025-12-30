import { useMemo, useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { Card } from '../components/ui/card';
import { SidebarProvider } from '../components/ui/sidebar';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { MenuEditor } from '../components/MenuEditor';
import { PromosEventsEditor } from '../components/PromosEventsEditor';
import { SettingsEditor } from '../components/SettingsEditor';
import { FloorPlanCanvasEditor } from './FloorPlanCanvasEditor';
import { FloorPlanSidebar } from '../components/FloorPlanSidebar';
import { RestaurantTableRow } from '../api/restaurantTablesApi';

type EditSection = 'tables' | 'menu' | 'promos' | 'settings';

export const ManagerEditConsole = () => {
  const managerUnlocked = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('managerUnlocked') === '1';
  }, []);

  const [activeSection, setActiveSection] = useState<EditSection>(() => {
    if (typeof window === 'undefined') return 'tables';
    const saved = sessionStorage.getItem('managerEditSection') as EditSection | null;
    return saved ?? 'tables';
  });

  // Table management state
  const [selectedTable, setSelectedTable] = useState<RestaurantTableRow | null>(null);
  const [tables, setTables] = useState<RestaurantTableRow[]>([]);

  const restaurantId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('restaurantId') ?? '';
  }, []);

  const handleMenuUpdate = () => {
    console.log('Menu updated');
  };

  const handlePromoUpdate = () => {
    console.log('Promo updated');
  };

  const handleEventUpdate = () => {
    console.log('Event updated');
  };

  const handleSettingsUpdate = () => {
    // Show a success message or refresh data
    alert('Restaurant settings have been updated successfully!');
  };

  // Table management callbacks
  const handleTableSelect = (table: RestaurantTableRow) => {
    setSelectedTable(table);
  };

  const handleTableUpdate = (updatedTable: RestaurantTableRow) => {
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    if (selectedTable?.id === updatedTable.id) {
      setSelectedTable(updatedTable);
    }
  };

  const handleTableDelete = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

  const handleTableAdd = (newTable: RestaurantTableRow) => {
    setTables(prev => [newTable, ...prev]);
  };

  const handleTablesLoaded = (loadedTables: RestaurantTableRow[]) => {
    setTables(loadedTables);
  };

  if (!managerUnlocked) {
    return (
      <StaffLayout title="Manager edit" subtitle="Locked" hideNav>
        <Card className="p-4 border border-slate-200 shadow-sm">
          <p className="text-sm text-gray-600">Manager edit is locked. Go to /manager and unlock first.</p>
        </Card>
      </StaffLayout>
    );
  }
 
  return (
    <StaffLayout title="Manager edit" subtitle="Configuration changes (Supabase source of truth)" hideNav>
      <div className="h-full w-full flex">
        {/* Left Sidebar - Manager Navigation */}
        <div className="w-[280px] flex-shrink-0">
          <SidebarProvider>
            <ManagerSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              restaurantId={restaurantId}
            />
          </SidebarProvider>
        </div>

        {/* Main Content Area - Dynamic Center Screen */}
        <div className="flex-1 h-full overflow-hidden min-w-0 min-w-[400px]">
          {/* Main Content Card */}
          <Card className="h-full border border-slate-200 shadow-sm">
            <div className="h-full overflow-auto p-6">
              {activeSection === 'tables' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Tables</p>
                      <h2 className="text-xl font-semibold text-gray-900">Tables & Floor Plan</h2>
                    </div>
                    
                    {/* FloorPlanCanvasEditor with table selection */}
                    <FloorPlanCanvasEditor
                      restaurantId={restaurantId}
                      onTableSelect={handleTableSelect}
                      onTablesLoaded={handleTablesLoaded}
                    />
                  </div>
                </>
              )}

              {activeSection === 'menu' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Menu</p>
                      <h2 className="text-xl font-semibold text-gray-900">Food & Drinks</h2>
                    </div>
                    
                    <MenuEditor
                      restaurantId={restaurantId}
                      onMenuUpdate={handleMenuUpdate}
                    />
                  </div>
                </>
              )}

              {activeSection === 'promos' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Promos</p>
                      <h2 className="text-xl font-semibold text-gray-900">Promotions & Events</h2>
                    </div>
                    
                    <PromosEventsEditor
                      restaurantId={restaurantId}
                      onPromoUpdate={handlePromoUpdate}
                      onEventUpdate={handleEventUpdate}
                    />
                  </div>
                </>
              )}

              {activeSection === 'settings' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Settings</p>
                      <h2 className="text-xl font-semibold text-gray-900">Restaurant Settings</h2>
                    </div>
                    
                    <SettingsEditor
                      restaurantId={restaurantId}
                      onSettingsUpdate={handleSettingsUpdate}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Contextual Tools */}
        <div className="w-80 h-full overflow-hidden">
          <Card className="h-full border border-slate-200 shadow-sm">
            <div className="h-full overflow-auto p-4">
              {activeSection === 'tables' && (
                <FloorPlanSidebar
                  isOpen={!!selectedTable}
                  onClose={() => setSelectedTable(null)}
                  selectedTable={selectedTable}
                  onTableUpdate={handleTableUpdate}
                  onTableDelete={handleTableDelete}
                  onTableAdd={handleTableAdd}
                  restaurantId={restaurantId}
                />
              )}

              {activeSection === 'menu' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Menu Tools</h3>
                  <p className="text-xs text-gray-500 mb-4">Use the menu editor to manage items</p>
                </div>
              )}

              {activeSection === 'promos' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Promo Tools</h3>
                  <p className="text-xs text-gray-500 mb-4">Use the promo editor to manage offers</p>
                </div>
              )}

              {activeSection === 'settings' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Settings Tools</h3>
                  <p className="text-xs text-gray-500 mb-4">Use the settings editor to configure</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
};
