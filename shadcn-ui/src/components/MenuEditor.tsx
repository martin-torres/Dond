import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import {
  Upload,
  Plus,
  Save,
  Trash2,
  FileSpreadsheet,
  FileText,
  Image,
  DollarSign,
  Tag,
  List,
  X,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Language, MenuItem } from '../types';
import { upsertRestaurantMenuItems, fetchRestaurantMenuItems } from '../api/restaurantMenuApi';
import { StationType, MenuKind } from '../api/restaurantMenuApi';

interface MenuEditorProps {
  restaurantId: string;
  onMenuUpdate?: () => void;
}

type MenuItemForm = {
  id?: string;
  kind: MenuKind;
  category: string;
  station: StationType;
  station_label: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: string;
  image_url: string;
};

export const MenuEditor = ({ restaurantId, onMenuUpdate }: MenuEditorProps) => {
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemForm[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItemForm | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Appetizers', 'Main Courses', 'Desserts', 'Beverages', 'Specials', 'Breakfast', 'Lunch', 'Dinner'
  ];

  const stationTypes: StationType[] = ['foh', 'bar', 'kitchen'];

  const menuKinds: MenuKind[] = ['food', 'drink'];

  useEffect(() => {
    loadMenuItems();
  }, [restaurantId]);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const items = await fetchRestaurantMenuItems(restaurantId);
      const forms = items.map(item => ({
        id: item.id,
        kind: item.kind,
        category: item.category || '',
        station: item.station,
        station_label: item.station_label || '',
        name_en: item.name.en || '',
        name_es: item.name.es || '',
        description_en: item.description?.en || '',
        description_es: item.description?.es || '',
        price: item.price.toString(),
        image_url: item.image_url || '',
      }));
      setMenuItems(forms);
      console.log('✅ Loaded menu items:', forms.length);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem({
      kind: 'food',
      category: '',
      station: 'kitchen',
      station_label: '',
      name_en: '',
      name_es: '',
      description_en: '',
      description_es: '',
      price: '0.00',
      image_url: '',
    });
  };

  const handleEditItem = (item: MenuItemForm) => {
    setEditingItem({ ...item });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      // For now, we'll just filter it out locally
      // In a real implementation, you'd call a delete API
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      onMenuUpdate?.();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;

    const validationErrors = [];
    
    if (!editingItem.name_en.trim()) validationErrors.push('English name is required');
    if (!editingItem.category) validationErrors.push('Category is required');
    if (!editingItem.price || isNaN(parseFloat(editingItem.price))) validationErrors.push('Valid price is required');

    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    const menuItem = {
      id: editingItem.id || undefined,
      restaurant_id: restaurantId,
      kind: editingItem.kind,
      category: editingItem.category,
      station: editingItem.station,
      station_label: editingItem.station_label || null,
      name: {
        en: editingItem.name_en,
        es: editingItem.name_es,
      },
      description: {
        en: editingItem.description_en,
        es: editingItem.description_es,
      },
      price: parseFloat(editingItem.price),
      image_url: editingItem.image_url || null,
      is_active: true,
      sort_order: 0, // Will be handled by the API
    } as unknown; // Type assertion to handle the undefined id case

    try {
      await upsertRestaurantMenuItems([menuItem]);
      setEditingItem(null);
      await loadMenuItems();
      onMenuUpdate?.();
      setImportStatus('✅ Menu item saved successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('📂 Reading file...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          await parseCSV(content);
        } else if (file.name.endsWith('.json')) {
          await parseJSON(content);
        } else {
          setImportStatus('❌ Please upload a CSV or JSON file');
          setTimeout(() => setImportStatus(''), 3000);
        }
      } catch (error) {
        console.error('Failed to parse file:', error);
        setImportStatus(`❌ Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTimeout(() => setImportStatus(''), 5000);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseCSV = async (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['name_en', 'category', 'kind', 'price'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    setImportStatus('📝 Parsing CSV data...');

    const newItems: MenuItemForm[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted values in CSV
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      for (const char of line) {
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      if (values.length < headers.length) continue;

      const item: MenuItemForm = {
        kind: (values[headers.indexOf('kind')]?.toLowerCase() || 'food') as MenuKind,
        category: values[headers.indexOf('category')] || '',
        station: (values[headers.indexOf('station')]?.toLowerCase() || 'kitchen') as StationType,
        station_label: values[headers.indexOf('station_label')] || '',
        name_en: values[headers.indexOf('name_en')] || '',
        name_es: values[headers.indexOf('name_es')] || '',
        description_en: values[headers.indexOf('description_en')] || '',
        description_es: values[headers.indexOf('description_es')] || '',
        price: values[headers.indexOf('price')] || '0.00',
        image_url: values[headers.indexOf('image_url')] || '',
      };

      newItems.push(item);
    }

    if (newItems.length === 0) {
      throw new Error('No valid items found in CSV');
    }

    setImportStatus(`💾 Saving ${newItems.length} items to database...`);

    // Save to database
    const itemsToSave = newItems.map(item => ({
      restaurant_id: restaurantId,
      kind: item.kind,
      category: item.category,
      station: item.station,
      station_label: item.station_label || null,
      name: {
        en: item.name_en,
        es: item.name_es,
      },
      description: {
        en: item.description_en,
        es: item.description_es,
      },
      price: parseFloat(item.price),
      image_url: item.image_url || null,
      is_active: true,
      sort_order: 0,
    }));

    await upsertRestaurantMenuItems(itemsToSave);
    await loadMenuItems();
    onMenuUpdate?.();
    
    setImportStatus(`✅ Successfully imported ${newItems.length} menu items!`);
    setTimeout(() => setImportStatus(''), 5000);
  };

  const parseJSON = async (content: string) => {
    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];
      
      if (items.length === 0) {
        throw new Error('JSON file contains no items');
      }

      setImportStatus(`📝 Parsing ${items.length} items from JSON...`);

      const newItems: MenuItemForm[] = items.map(item => ({
        kind: item.kind || 'food',
        category: item.category || '',
        station: item.station || 'kitchen',
        station_label: item.station_label || '',
        name_en: item.name?.en || item.name || '',
        name_es: item.name?.es || '',
        description_en: item.description?.en || '',
        description_es: item.description?.es || '',
        price: item.price?.toString() || '0.00',
        image_url: item.image_url || '',
      }));

      setImportStatus(`💾 Saving ${newItems.length} items to database...`);

      // Save to database
      const itemsToSave = newItems.map(item => ({
        restaurant_id: restaurantId,
        kind: item.kind,
        category: item.category,
        station: item.station,
        station_label: item.station_label || null,
        name: {
          en: item.name_en,
          es: item.name_es,
        },
        description: {
          en: item.description_en,
          es: item.description_es,
        },
        price: parseFloat(item.price),
        image_url: item.image_url || null,
        is_active: true,
        sort_order: 0,
      }));

      await upsertRestaurantMenuItems(itemsToSave);
      await loadMenuItems();
      onMenuUpdate?.();
      
      setImportStatus(`✅ Successfully imported ${newItems.length} menu items!`);
      setTimeout(() => setImportStatus(''), 5000);
    } catch (error) {
      throw new Error('Invalid JSON format: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const exportMenu = () => {
    if (menuItems.length === 0) {
      alert('No menu items to export');
      return;
    }

    const exportData = menuItems.map(item => ({
      name_en: item.name_en,
      name_es: item.name_es,
      category: item.category,
      kind: item.kind,
      station: item.station,
      station_label: item.station_label,
      description_en: item.description_en,
      description_es: item.description_es,
      price: item.price,
      image_url: item.image_url,
    }));

    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(item => Object.values(item).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu-items-${restaurantId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = [
      'name_en,name_es,category,kind,station,station_label,description_en,description_es,price,image_url',
      '"Margherita Pizza","Pizza Margherita","Main Courses","food","kitchen","","Fresh mozzarella, tomatoes, and basil","Mozzarella fresca, tomates y albahaca","12.99",""',
      '"Caesar Salad","Ensalada César","Appetizers","food","kitchen","","Romaine lettuce with Caesar dressing","Lechuga romana con aderezo César","8.99",""',
      '"Craft Beer","Cerveza Artesanal","Beverages","drink","bar","","Local craft beer selection","Selección de cerveza artesanal local","6.99",""',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Menu Management</h2>
          <p className="text-sm text-slate-600">Add, edit, and manage menu items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} title="Download CSV template">
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={exportMenu}>
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Import Status */}
      {importStatus && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <AlertCircle className="h-4 w-4" />
            {importStatus}
          </div>
        </Card>
      )}

      {/* Import Instructions */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <h3 className="text-sm font-semibold mb-2">📋 CSV Import Instructions</h3>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>• <strong>Required columns:</strong> name_en, category, kind, price</li>
          <li>• <strong>Optional columns:</strong> name_es, description_en, description_es, station, station_label, image_url</li>
          <li>• <strong>kind values:</strong> "food" or "drink"</li>
          <li>• <strong>station values:</strong> "kitchen", "bar", or "foh"</li>
          <li>• Click "Template" button to download a sample CSV file</li>
        </ul>
      </Card>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Menu Items List */}
      <Card className="h-96">
        <ScrollArea className="h-full">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading menu items...</div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No menu items found.</p>
                <p className="text-xs mt-2">Add items manually or import from CSV</p>
              </div>
            ) : (
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{item.name_en}</span>
                          {item.name_es && <span className="text-sm text-slate-500">({item.name_es})</span>}
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{item.kind}</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{item.category}</span>
                        </div>
                        <div className="text-sm text-slate-600">{item.description_en}</div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium">${item.price}</span>
                          <span className="text-slate-500">Station: {item.station}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id || index.toString())}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Edit Form - Inline in center screen */}
      {editingItem && (
        <Card className="border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold">{editingItem.id ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
            <Button variant="ghost" onClick={() => setEditingItem(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6 overflow-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kind">Item Type *</Label>
                  <select
                    id="kind"
                    value={editingItem.kind}
                    onChange={(e) => setEditingItem({...editingItem, kind: e.target.value as MenuKind})}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    {menuKinds.map(kind => (
                      <option key={kind} value={kind}>{kind === 'food' ? 'Food' : 'Drink'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station">Station</Label>
                  <select
                    id="station"
                    value={editingItem.station}
                    onChange={(e) => setEditingItem({...editingItem, station: e.target.value as StationType})}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    {stationTypes.map(station => (
                      <option key={station} value={station}>{station.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name_en">Name (English) *</Label>
                  <Input
                    id="name_en"
                    value={editingItem.name_en}
                    onChange={(e) => setEditingItem({...editingItem, name_en: e.target.value})}
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_es">Name (Spanish)</Label>
                  <Input
                    id="name_es"
                    value={editingItem.name_es}
                    onChange={(e) => setEditingItem({...editingItem, name_es: e.target.value})}
                    placeholder="e.g., Pizza Margherita"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    value={editingItem.description_en}
                    onChange={(e) => setEditingItem({...editingItem, description_en: e.target.value})}
                    placeholder="Describe the item in English"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_es">Description (Spanish)</Label>
                  <Textarea
                    id="description_es"
                    value={editingItem.description_es}
                    onChange={(e) => setEditingItem({...editingItem, description_es: e.target.value})}
                    placeholder="Describe el artículo en español"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    value={editingItem.image_url}
                    onChange={(e) => setEditingItem({...editingItem, image_url: e.target.value})}
                    placeholder="/images/ImageUpload.jpg"
                  />
                  <Button variant="outline">
                    <Image className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveItem}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Item
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
      )}
    </div>
  );
};