import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Plus,
  Save,
  Trash2,
  Edit,
  Eye,
  Calendar as CalendarIcon,
  Gift,
  Image as ImageIcon,
  Layout,
  Monitor,
  Smartphone,
  Grid,
  Columns,
  Square,
  DollarSign,
  Clock,
  Users,
  X,
  Percent,
} from 'lucide-react';
import { upsertRestaurantPromos, fetchRestaurantPromos, deletePromo, upsertRestaurantEvents, fetchRestaurantEvents, deleteEvent } from '../api/promosEventsApi';
import { LayoutType, MenuCategory, PromoRow, EventRow } from '../api/promosEventsApi';
import { fetchRestaurantMenuItems } from '../api/restaurantMenuApi';

interface PromosEventsEditorProps {
  restaurantId: string;
  onPromoUpdate?: () => void;
  onEventUpdate?: () => void;
}

interface MenuItem {
  id: string;
  name: Record<string, string>;
  kind: 'food' | 'drink';
  category?: string;
  price?: number;
  [key: string]: unknown;
}

type PromoForm = {
  id?: string;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  discount_percent: string;
  discount_amount: string;
  image_url: string;
  menu_item_id: string;
  menu_category: MenuCategory | '';
  layout_type: LayoutType;
  start_date: string;
  end_date: string;
};

type EventForm = {
  id?: string;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  image_url: string;
  event_date: string;
  start_time: string;
  end_time: string;
};

export const PromosEventsEditor = ({ restaurantId, onPromoUpdate, onEventUpdate }: PromosEventsEditorProps) => {
  const [activeTab, setActiveTab] = useState<'promos' | 'events'>('promos');
  const [promos, setPromos] = useState<PromoForm[]>([]);
  const [events, setEvents] = useState<EventForm[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingPromo, setEditingPromo] = useState<PromoForm | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventForm | null>(null);
  const [loading, setLoading] = useState(false);

  const layoutTypes: LayoutType[] = ['full_width', 'two_column', 'three_column'];
  const menuCategories: MenuCategory[] = ['food', 'drinks', 'all'];

  useEffect(() => {
    loadPromosAndEvents();
    loadMenuItems();
  }, [restaurantId]);

  const loadPromosAndEvents = async () => {
    setLoading(true);
    try {
      const [promoData, eventData] = await Promise.all([
        fetchRestaurantPromos(restaurantId),
        fetchRestaurantEvents(restaurantId)
      ]);

      const promoForms = promoData.map(promo => ({
        id: promo.id,
        title_en: promo.title.en || '',
        title_es: promo.title.es || '',
        description_en: promo.description?.en || '',
        description_es: promo.description?.es || '',
        discount_percent: promo.discount_percent.toString(),
        discount_amount: promo.discount_amount.toString(),
        image_url: promo.image_url || '',
        menu_item_id: promo.menu_item_id || '',
        menu_category: (promo.menu_category || '') as MenuCategory | '',
        layout_type: promo.layout_type,
        start_date: promo.start_date || '',
        end_date: promo.end_date || '',
      }));

      const eventForms = eventData.map(event => ({
        id: event.id,
        title_en: event.title.en || '',
        title_es: event.title.es || '',
        description_en: event.description?.en || '',
        description_es: event.description?.es || '',
        image_url: event.image_url || '',
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
      }));

      setPromos(promoForms);
      setEvents(eventForms);
    } catch (error) {
      console.error('Failed to load promos and events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const items = await fetchRestaurantMenuItems(restaurantId);
      setMenuItems(items as MenuItem[]);
      console.log('✅ Loaded menu items for promo selection:', items.length);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const handleAddPromo = () => {
    setEditingPromo({
      title_en: '',
      title_es: '',
      description_en: '',
      description_es: '',
      discount_percent: '0',
      discount_amount: '0',
      image_url: '',
      menu_item_id: '',
      menu_category: '',
      layout_type: 'full_width',
      start_date: '',
      end_date: '',
    });
  };

  const handleAddEvent = () => {
    setEditingEvent({
      title_en: '',
      title_es: '',
      description_en: '',
      description_es: '',
      image_url: '',
      event_date: '',
      start_time: '',
      end_time: '',
    });
  };

  const handleEditPromo = (promo: PromoForm) => {
    setEditingPromo({ ...promo });
  };

  const handleEditEvent = (event: EventForm) => {
    setEditingEvent({ ...event });
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo?')) return;
    
    try {
      await deletePromo(promoId);
      setPromos(prev => prev.filter(promo => promo.id !== promoId));
      onPromoUpdate?.();
    } catch (error) {
      console.error('Failed to delete promo:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      onEventUpdate?.();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleSavePromo = async () => {
    if (!editingPromo) return;

    const validationErrors = [];
    
    if (!editingPromo.title_en.trim()) validationErrors.push('English title is required');
    if (!editingPromo.description_en.trim()) validationErrors.push('English description is required');
    if (!editingPromo.layout_type) validationErrors.push('Layout type is required');

    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    const promo = {
      id: editingPromo.id || undefined,
      restaurant_id: restaurantId,
      title: {
        en: editingPromo.title_en,
        es: editingPromo.title_es,
      },
      description: {
        en: editingPromo.description_en,
        es: editingPromo.description_es,
      },
      discount_percent: parseFloat(editingPromo.discount_percent || '0'),
      discount_amount: parseFloat(editingPromo.discount_amount || '0'),
      image_url: editingPromo.image_url || null,
      menu_item_id: editingPromo.menu_item_id || null,
      menu_category: editingPromo.menu_category || null,
      layout_type: editingPromo.layout_type,
      is_active: true,
      start_date: editingPromo.start_date || null,
      end_date: editingPromo.end_date || null,
    };

    try {
      await upsertRestaurantPromos([promo]);
      setEditingPromo(null);
      await loadPromosAndEvents();
      onPromoUpdate?.();
    } catch (error) {
      console.error('Failed to save promo:', error);
      alert('Failed to save promo. Please try again.');
    }
  };

  const handleSaveEvent = async () => {
    if (!editingEvent) return;

    const validationErrors = [];
    
    if (!editingEvent.title_en.trim()) validationErrors.push('English title is required');
    if (!editingEvent.description_en.trim()) validationErrors.push('English description is required');
    if (!editingEvent.event_date) validationErrors.push('Event date is required');
    if (!editingEvent.start_time) validationErrors.push('Start time is required');
    if (!editingEvent.end_time) validationErrors.push('End time is required');

    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    const event = {
      id: editingEvent.id || undefined,
      restaurant_id: restaurantId,
      title: {
        en: editingEvent.title_en,
        es: editingEvent.title_es,
      },
      description: {
        en: editingEvent.description_en,
        es: editingEvent.description_es,
      },
      image_url: editingEvent.image_url || null,
      event_date: editingEvent.event_date,
      start_time: editingEvent.start_time,
      end_time: editingEvent.end_time,
      is_active: true,
    };

    try {
      await upsertRestaurantEvents([event]);
      setEditingEvent(null);
      await loadPromosAndEvents();
      onEventUpdate?.();
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const getLayoutPreview = (layoutType: LayoutType) => {
    switch (layoutType) {
      case 'full_width':
        return (
          <div className="w-full h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold">
            Full Width Layout
          </div>
        );
      case 'two_column':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
              2-Column
            </div>
            <div className="h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
              2-Column
            </div>
          </div>
        );
      case 'three_column':
        return (
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
              3-Column
            </div>
            <div className="h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
              3-Column
            </div>
            <div className="h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
              3-Column
            </div>
          </div>
        );
    }
  };

  // Helper function to get menu item name
  const getMenuItemName = (menuItemId: string) => {
    const item = menuItems.find(m => m.id === menuItemId);
    if (!item) return 'Unknown Item';
    return item.name?.en || item.name?.es || 'Unknown Item';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Promos & Events</h2>
            <p className="text-sm text-slate-600">Create and manage promos and events</p>
          </div>
        </div>
        <Card className="h-96">
          <div className="p-4 text-center text-slate-500">
            Loading promos and events...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('promos')}
          className={`flex-1 px-4 py-2 text-sm font-semibold ${
            activeTab === 'promos'
              ? 'text-slate-700 border-b-2 border-emerald-500 bg-emerald-50'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Gift className="h-4 w-4" />
            Promos
          </div>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 px-4 py-2 text-sm font-semibold ${
            activeTab === 'events'
              ? 'text-slate-700 border-b-2 border-emerald-500 bg-emerald-50'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Events
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'promos' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Promo Management</h2>
                <p className="text-sm text-slate-600">Create and manage promotional offers</p>
              </div>
              <Button onClick={handleAddPromo}>
                <Plus className="h-4 w-4 mr-2" />
                Add Promo
              </Button>
            </div>

            {/* Promos List */}
            <Card className="h-96">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {promos.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No promos found. Create your first promo to attract customers.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {promos.map((promo, index) => (
                        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{promo.title_en}</span>
                                {promo.title_es && <span className="text-sm text-slate-500">({promo.title_es})</span>}
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{promo.layout_type}</span>
                              </div>
                              <div className="text-sm text-slate-600 mb-2">{promo.description_en}</div>
                              
                              {/* Layout Preview */}
                              <div className="mb-3">
                                <Label className="text-xs text-slate-500 mb-2 block">Layout Preview</Label>
                                {getLayoutPreview(promo.layout_type)}
                              </div>

                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                {promo.discount_percent && parseFloat(promo.discount_percent) > 0 && (
                                  <span className="font-medium text-green-600">{promo.discount_percent}% off</span>
                                )}
                                {promo.discount_amount && parseFloat(promo.discount_amount) > 0 && (
                                  <span className="font-medium text-green-600">${promo.discount_amount} off</span>
                                )}
                                {promo.menu_item_id && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Item: {getMenuItemName(promo.menu_item_id)}
                                  </span>
                                )}
                                {promo.menu_category && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{promo.menu_category}</span>
                                )}
                                {promo.start_date && promo.end_date && (
                                  <span className="text-slate-500">Valid: {promo.start_date} to {promo.end_date}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditPromo(promo)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeletePromo(promo.id || index.toString())}>
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
          </>
        )}

        {activeTab === 'events' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Event Management</h2>
                <p className="text-sm text-slate-600">Create and manage special events</p>
              </div>
              <Button onClick={handleAddEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>

            {/* Events List */}
            <Card className="h-96">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No events found. Create your first event to engage customers.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event, index) => (
                        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{event.title_en}</span>
                                {event.title_es && <span className="text-sm text-slate-500">({event.title_es})</span>}
                              </div>
                              <div className="text-sm text-slate-600 mb-2">{event.description_en}</div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-slate-500">
                                  <CalendarIcon className="h-4 w-4" />
                                  {event.event_date}
                                </div>
                                <div className="flex items-center gap-1 text-slate-500">
                                  <Clock className="h-4 w-4" />
                                  {event.start_time} - {event.end_time}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id || index.toString())}>
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
          </>
        )}
      </div>

      {/* Promo Edit Modal */}
      {editingPromo && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingPromo.id ? 'Edit Promo' : 'Add New Promo'}</h3>
            <Button variant="ghost" onClick={() => setEditingPromo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English) *</Label>
              <Input
                id="title_en"
                value={editingPromo.title_en}
                onChange={(e) => setEditingPromo({...editingPromo, title_en: e.target.value})}
                placeholder="e.g., Welcome Special"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_es">Title (Spanish)</Label>
              <Input
                id="title_es"
                value={editingPromo.title_es}
                onChange={(e) => setEditingPromo({...editingPromo, title_es: e.target.value})}
                placeholder="e.g., Especial de Bienvenida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percent">Discount Percentage</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="discount_percent"
                  type="number"
                  step="0.01"
                  value={editingPromo.discount_percent}
                  onChange={(e) => setEditingPromo({...editingPromo, discount_percent: e.target.value})}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_amount">Discount Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  value={editingPromo.discount_amount}
                  onChange={(e) => setEditingPromo({...editingPromo, discount_amount: e.target.value})}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout_type">Layout Type *</Label>
              <Select
                value={editingPromo.layout_type}
                onValueChange={(value) => setEditingPromo({...editingPromo, layout_type: value as LayoutType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select layout type" />
                </SelectTrigger>
                <SelectContent>
                  {layoutTypes.map(layout => (
                    <SelectItem key={layout} value={layout}>
                      {layout === 'full_width' && 'Full Width'}
                      {layout === 'two_column' && 'Two Column'}
                      {layout === 'three_column' && 'Three Column'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu_category">Menu Category</Label>
              <Select
                value={editingPromo.menu_category}
                onValueChange={(value) => setEditingPromo({...editingPromo, menu_category: value as MenuCategory})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select menu category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Menu Items</SelectItem>
                  {menuCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu_item_id">Specific Menu Item (Optional)</Label>
              <Select
                value={editingPromo.menu_item_id}
                onValueChange={(value) => setEditingPromo({...editingPromo, menu_item_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a menu item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">None (applies to category)</SelectItem>
                  {menuItems.length === 0 ? (
                    <SelectItem value="" disabled>No menu items available</SelectItem>
                  ) : (
                    <>
                      {/* Food Items */}
                      {menuItems.filter(item => item.kind === 'food').length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100">FOOD</div>
                          {menuItems
                            .filter(item => item.kind === 'food')
                            .map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name?.en || item.name?.es || 'Unnamed Item'} {item.price ? `($${item.price})` : ''}
                              </SelectItem>
                            ))}
                        </>
                      )}
                      {/* Drink Items */}
                      {menuItems.filter(item => item.kind === 'drink').length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100">DRINKS</div>
                          {menuItems
                            .filter(item => item.kind === 'drink')
                            .map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name?.en || item.name?.es || 'Unnamed Item'} {item.price ? `($${item.price})` : ''}
                              </SelectItem>
                            ))}
                        </>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {menuItems.length === 0 
                  ? 'No menu items found. Add menu items first in the Menu section.'
                  : `${menuItems.length} menu items available`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={editingPromo.start_date}
                onChange={(e) => setEditingPromo({...editingPromo, start_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={editingPromo.end_date}
                onChange={(e) => setEditingPromo({...editingPromo, end_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="description_en">Description (English) *</Label>
              <Textarea
                id="description_en"
                value={editingPromo.description_en}
                onChange={(e) => setEditingPromo({...editingPromo, description_en: e.target.value})}
                placeholder="Describe the promo in English"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_es">Description (Spanish)</Label>
              <Textarea
                id="description_es"
                value={editingPromo.description_es}
                onChange={(e) => setEditingPromo({...editingPromo, description_es: e.target.value})}
                placeholder="Describe la promo en español"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="image_url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image_url"
                value={editingPromo.image_url}
                onChange={(e) => setEditingPromo({...editingPromo, image_url: e.target.value})}
                placeholder="/images/PromoImage.jpg"
              />
              <Button variant="outline">
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Layout Preview */}
          <div className="mt-6">
            <Label className="text-sm font-medium mb-2 block">Live Preview</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
              {getLayoutPreview(editingPromo.layout_type)}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSavePromo}>
              <Save className="h-4 w-4 mr-2" />
              Save Promo
            </Button>
            <Button variant="outline" onClick={() => setEditingPromo(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Event Edit Modal */}
      {editingEvent && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingEvent.id ? 'Edit Event' : 'Add New Event'}</h3>
            <Button variant="ghost" onClick={() => setEditingEvent(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_title_en">Title (English) *</Label>
              <Input
                id="event_title_en"
                value={editingEvent.title_en}
                onChange={(e) => setEditingEvent({...editingEvent, title_en: e.target.value})}
                placeholder="e.g., Live Music Night"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_title_es">Title (Spanish)</Label>
              <Input
                id="event_title_es"
                value={editingEvent.title_es}
                onChange={(e) => setEditingEvent({...editingEvent, title_es: e.target.value})}
                placeholder="e.g., Noche de Música en Vivo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={editingEvent.event_date}
                onChange={(e) => setEditingEvent({...editingEvent, event_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={editingEvent.start_time}
                onChange={(e) => setEditingEvent({...editingEvent, start_time: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={editingEvent.end_time}
                onChange={(e) => setEditingEvent({...editingEvent, end_time: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="event_description_en">Description (English) *</Label>
              <Textarea
                id="event_description_en"
                value={editingEvent.description_en}
                onChange={(e) => setEditingEvent({...editingEvent, description_en: e.target.value})}
                placeholder="Describe the event in English"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_description_es">Description (Spanish)</Label>
              <Textarea
                id="event_description_es"
                value={editingEvent.description_es}
                onChange={(e) => setEditingEvent({...editingEvent, description_es: e.target.value})}
                placeholder="Describe el evento en español"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="event_image_url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="event_image_url"
                value={editingEvent.image_url}
                onChange={(e) => setEditingEvent({...editingEvent, image_url: e.target.value})}
                placeholder="/images/EventImage.jpg"
              />
              <Button variant="outline">
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSaveEvent}>
              <Save className="h-4 w-4 mr-2" />
              Save Event
            </Button>
            <Button variant="outline" onClick={() => setEditingEvent(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};