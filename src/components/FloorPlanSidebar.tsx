import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Edit,
  Save,
  Trash2,
  RotateCcw,
  RotateCw,
  Square,
  Circle,
  RectangleHorizontal,
  SquareFunction,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Settings,
  Table,
  X,
} from 'lucide-react';
import { ManagerTablesPanel } from '../staff/ManagerTablesPanel';
import { SeedTablesToSupabase } from '../staff/SeedTablesToSupabase';

interface FloorPlanSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTable: any;
  onTableUpdate: (table: any) => void;
  onTableDelete: (tableId: string) => void;
  onTableAdd: (table: any) => void;
  restaurantId: string;
}

type TableShape = 'auto' | 'circle' | 'rounded' | 'rect' | 'booth_u' | 'booth_half_u';

export const FloorPlanSidebar = ({
  isOpen,
  onClose,
  selectedTable,
  onTableUpdate,
  onTableDelete,
  onTableAdd,
  restaurantId,
}: FloorPlanSidebarProps) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [draftTable, setDraftTable] = useState<any>(null);

  const shapes: Array<{ id: TableShape; label: string; icon: React.ReactNode }> = [
    { id: 'auto', label: 'Auto', icon: <Square className="h-4 w-4" /> },
    { id: 'circle', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
    { id: 'rounded', label: 'Rounded', icon: <SquareFunction className="h-4 w-4" /> },
    { id: 'rect', label: 'Rectangle', icon: <RectangleHorizontal className="h-4 w-4" /> },
    { id: 'booth_u', label: 'Booth U', icon: <Square className="h-4 w-4" /> },
    { id: 'booth_half_u', label: 'Booth Half U', icon: <Square className="h-4 w-4" /> },
  ];

  const handleShapeChange = (shape: TableShape) => {
    if (selectedTable) {
      onTableUpdate({ ...selectedTable, shape });
    } else if (draftTable) {
      setDraftTable({ ...draftTable, shape });
    }
  };

  const handleRotation = (direction: 'left' | 'right') => {
    const step = 22.5;
    const currentRotation = selectedTable?.rotation || draftTable?.rotation || 0;
    const newRotation = direction === 'left' 
      ? ((currentRotation - step) % 360 + 360) % 360
      : ((currentRotation + step) % 360 + 360) % 360;
    
    if (selectedTable) {
      onTableUpdate({ ...selectedTable, rotation: Math.round(newRotation * 10) / 10 });
    } else if (draftTable) {
      setDraftTable({ ...draftTable, rotation: Math.round(newRotation * 10) / 10 });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (selectedTable) {
      // For simplicity, we'll just update the position/size conceptually
      // In a real implementation, you'd update the actual table dimensions
      onTableUpdate({ ...selectedTable, [dimension]: value });
    } else if (draftTable) {
      setDraftTable({ ...draftTable, [dimension]: value });
    }
  };

  const handleStartDraft = () => {
    const newDraft = {
      id: `draft-${Date.now()}`,
      display_name: 'New Table',
      table_number: null,
      seats: 4,
      location: null,
      section: null,
      available: true,
      visible_to_customers: true,
      x: 100,
      y: 100,
      shape: 'auto' as TableShape,
      rotation: 0,
      is_interactive: true,
    };
    setDraftTable(newDraft);
    setActiveTab('edit');
  };

  const handleConfirmDraft = () => {
    if (draftTable) {
      onTableAdd(draftTable);
      setDraftTable(null);
    }
  };

  const handleCancelDraft = () => {
    setDraftTable(null);
  };

  const handleDeleteTable = () => {
    if (selectedTable && confirm('Delete this table?')) {
      onTableDelete(selectedTable.id);
    }
  };

  return (
    <div className={`h-full flex-shrink-0 transition-all duration-300 ${isOpen ? 'w-80' : 'w-0'}`}>
      {isOpen && (
        <Card className="h-full border border-slate-200 bg-white shadow-sm flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <Table className="h-5 w-5 text-slate-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  {selectedTable ? selectedTable.display_name : draftTable ? 'Add Table' : 'Table Properties'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTable ? 'Edit selected table' : draftTable ? 'Configure new table' : 'Select a table to edit'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              title="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tabs Header */}
              <TabsList className="grid grid-cols-3 gap-2 p-3 bg-slate-50">
                <TabsTrigger value="edit" className="text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="tables" className="text-xs">
                  <Table className="h-3 w-3 mr-1" />
                  Tables
                </TabsTrigger>
                <TabsTrigger value="tools" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Tools
                </TabsTrigger>
              </TabsList>

              {/* Edit Tab */}
              <TabsContent value="edit" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {!selectedTable && !draftTable ? (
                      <div className="text-center py-8 text-slate-500">
                        <Table className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm">Select a table to edit</p>
                        <p className="text-xs text-slate-400 mt-1">Or add a new table</p>
                      </div>
                    ) : (
                      <>
                        {/* Table Information */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Table Name</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRotation('left')}
                                disabled={!selectedTable && !draftTable}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRotation('right')}
                                disabled={!selectedTable && !draftTable}
                              >
                                <RotateCw className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <Input
                            value={selectedTable?.display_name || draftTable?.display_name || ''}
                            onChange={(e) => {
                              if (selectedTable) {
                                onTableUpdate({ ...selectedTable, display_name: e.target.value });
                              } else if (draftTable) {
                                setDraftTable({ ...draftTable, display_name: e.target.value });
                              }
                            }}
                            placeholder="Table name"
                            disabled={!selectedTable && !draftTable}
                          />
                        </div>

                        {/* Shape Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Shape</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {shapes.map((shape) => (
                              <Button
                                key={shape.id}
                                variant={((selectedTable?.shape || draftTable?.shape) === shape.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleShapeChange(shape.id)}
                                className="justify-start text-xs"
                                disabled={!selectedTable && !draftTable}
                              >
                                {shape.icon}
                                <span className="ml-2">{shape.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Table Properties */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Seats</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentSeats = selectedTable?.seats || draftTable?.seats || 0;
                                  const newSeats = Math.max(0, currentSeats - 1);
                                  if (selectedTable) onTableUpdate({ ...selectedTable, seats: newSeats });
                                  else if (draftTable) setDraftTable({ ...draftTable, seats: newSeats });
                                }}
                                disabled={!selectedTable && !draftTable}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={selectedTable?.seats || draftTable?.seats || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  if (selectedTable) onTableUpdate({ ...selectedTable, seats: value });
                                  else if (draftTable) setDraftTable({ ...draftTable, seats: value });
                                }}
                                className="text-center"
                                disabled={!selectedTable && !draftTable}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentSeats = selectedTable?.seats || draftTable?.seats || 0;
                                  const newSeats = currentSeats + 1;
                                  if (selectedTable) onTableUpdate({ ...selectedTable, seats: newSeats });
                                  else if (draftTable) setDraftTable({ ...draftTable, seats: newSeats });
                                }}
                                disabled={!selectedTable && !draftTable}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Rotation</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={selectedTable?.rotation || draftTable?.rotation || 0}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  if (selectedTable) onTableUpdate({ ...selectedTable, rotation: value });
                                  else if (draftTable) setDraftTable({ ...draftTable, rotation: value });
                                }}
                                className="text-center"
                                disabled={!selectedTable && !draftTable}
                              />
                              <span className="text-xs text-slate-500">°</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Toggle */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Interactive</Label>
                          <Button
                            variant={((selectedTable?.is_interactive !== false) || (draftTable?.is_interactive !== false)) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newValue = !(selectedTable?.is_interactive !== false) || !(draftTable?.is_interactive !== false);
                              if (selectedTable) onTableUpdate({ ...selectedTable, is_interactive: newValue });
                              else if (draftTable) setDraftTable({ ...draftTable, is_interactive: newValue });
                            }}
                            disabled={!selectedTable && !draftTable}
                          >
                            {((selectedTable?.is_interactive !== false) || (draftTable?.is_interactive !== false)) ? (
                              <Eye className="h-3 w-3 mr-1" />
                            ) : (
                              <EyeOff className="h-3 w-3 mr-1" />
                            )}
                            {((selectedTable?.is_interactive !== false) || (draftTable?.is_interactive !== false)) ? 'Visible' : 'Hidden'}
                          </Button>
                        </div>

                        {/* Actions */}
                        {selectedTable && (
                          <div className="space-y-2 pt-4">
                            <Button
                              variant="destructive"
                              className="w-full"
                              onClick={handleDeleteTable}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Table
                            </Button>
                          </div>
                        )}

                        {/* Draft Actions */}
                        {draftTable && (
                          <div className="space-y-2 pt-4">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={handleCancelDraft}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="w-full"
                              onClick={handleConfirmDraft}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Add Table
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Tables Tab */}
              <TabsContent value="tables" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <ManagerTablesPanel enabled />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <SeedTablesToSupabase enabled restaurantId={restaurantId} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-3">
            {selectedTable || draftTable ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  Selected: {selectedTable?.display_name || draftTable?.display_name || 'None'}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleStartDraft}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Table
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Save action - in real implementation, this would save to database
                      alert('Changes saved!');
                    }}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={handleStartDraft}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Table
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
