import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import {
  Settings as SettingsIcon,
  Save,
  Trash2,
  Edit,
  Globe,
  DollarSign,
  Clock,
  Users,
  CreditCard,
  Bell,
  MapPin,
  Phone,
  Mail,
  Percent,
} from 'lucide-react';
import { fetchRestaurantSettings, updateRestaurantSettings } from '../api/restaurantSettingsApi';
import { RestaurantSettings, FormSettings } from '../types/restaurantSettings';

interface SettingsEditorProps {
  restaurantId: string;
  onSettingsUpdate?: () => void;
}


export const SettingsEditor = ({ restaurantId, onSettingsUpdate }: SettingsEditorProps) => {
  const [settings, setSettings] = useState<FormSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'MXN', name: 'Mexican Peso (MX$)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
  ];

  useEffect(() => {
    loadSettings();
  }, [restaurantId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const apiSettings = await fetchRestaurantSettings(restaurantId);
      if (apiSettings) {
        // Convert API settings to form settings
        const formSettings: FormSettings = {
          id: apiSettings.id,
          name: apiSettings.name.en,
          name_es: apiSettings.name.es || '',
          address: apiSettings.address,
          phone: apiSettings.phone,
          email: apiSettings.email,
          website: apiSettings.website,
          currency: apiSettings.currency,
          tax_rate: apiSettings.tax_rate.toString(),
          service_fee: apiSettings.service_fee.toString(),
          max_wait_time: apiSettings.max_wait_time.toString(),
          allow_online_orders: apiSettings.allow_online_orders,
          allow_reservations: apiSettings.allow_reservations,
          allow_table_requests: apiSettings.allow_table_requests,
          enable_notifications: apiSettings.enable_notifications,
          enable_loyalty_program: apiSettings.enable_loyalty_program,
          enable_table_management: apiSettings.enable_table_management,
          enable_kitchen_display: apiSettings.enable_kitchen_display,
          enable_bar_display: apiSettings.enable_bar_display,
          enable_foh_display: apiSettings.enable_foh_display,
          qr_code_enabled: apiSettings.qr_code_enabled,
          demo_mode: apiSettings.demo_mode,
        };
        setSettings(formSettings);
      } else {
        // Fallback to defaults if no settings found
        const defaultSettings: FormSettings = {
          id: restaurantId,
          name: 'Restaurant Name',
          name_es: '',
          address: '123 Main Street, City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'info@restaurant.com',
          website: 'https://restaurant.com',
          currency: 'USD',
          tax_rate: '8.25',
          service_fee: '0.00',
          max_wait_time: '30',
          allow_online_orders: true,
          allow_reservations: true,
          allow_table_requests: true,
          enable_notifications: true,
          enable_loyalty_program: false,
          enable_table_management: true,
          enable_kitchen_display: true,
          enable_bar_display: true,
          enable_foh_display: true,
          qr_code_enabled: true,
          demo_mode: false,
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('Failed to load settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    const validationErrors = [];

    if (!settings.name.trim()) validationErrors.push('Restaurant name is required');
    if (!settings.address.trim()) validationErrors.push('Address is required');
    if (!settings.phone.trim()) validationErrors.push('Phone number is required');
    if (!settings.email.trim()) validationErrors.push('Email is required');
    if (!settings.currency) validationErrors.push('Currency is required');

    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    try {
      // Convert form data to API format
      const apiSettings: RestaurantSettings = {
        id: settings.id || restaurantId,
        slug: '', // This will be ignored in update
        name: {
          en: settings.name,
          es: settings.name_es || '',
        },
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        currency: settings.currency,
        tax_rate: parseFloat(settings.tax_rate),
        service_fee: parseFloat(settings.service_fee),
        max_wait_time: parseInt(settings.max_wait_time),
        allow_online_orders: settings.allow_online_orders,
        allow_reservations: settings.allow_reservations,
        allow_table_requests: settings.allow_table_requests,
        enable_notifications: settings.enable_notifications,
        enable_loyalty_program: settings.enable_loyalty_program,
        enable_table_management: settings.enable_table_management,
        enable_kitchen_display: settings.enable_kitchen_display,
        enable_bar_display: settings.enable_bar_display,
        enable_foh_display: settings.enable_foh_display,
        qr_code_enabled: settings.qr_code_enabled,
        demo_mode: settings.demo_mode,
      };

      await updateRestaurantSettings(apiSettings);
      setEditing(false);
      onSettingsUpdate?.();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleResetToDefaults = () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return;

    const defaultSettings: FormSettings = {
      id: restaurantId,
      name: 'Restaurant Name',
      name_es: '',
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@restaurant.com',
      website: 'https://restaurant.com',
      currency: 'USD',
      tax_rate: '8.25',
      service_fee: '0.00',
      max_wait_time: '30',
      allow_online_orders: true,
      allow_reservations: true,
      allow_table_requests: true,
      enable_notifications: true,
      enable_loyalty_program: false,
      enable_table_management: true,
      enable_kitchen_display: true,
      enable_bar_display: true,
      enable_foh_display: true,
      qr_code_enabled: true,
      demo_mode: false,
    };

    setSettings(defaultSettings);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Restaurant Settings</h2>
            <p className="text-sm text-slate-600">Configure your restaurant's settings</p>
          </div>
        </div>
        <Card className="h-96">
          <div className="p-4 text-center text-slate-500">
            Loading settings...
          </div>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Restaurant Settings</h2>
            <p className="text-sm text-slate-600">Configure your restaurant's settings</p>
          </div>
        </div>
        <Card className="h-96">
          <div className="p-4 text-center text-slate-500">
            Failed to load settings. Please try again.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Restaurant Settings</h2>
          <p className="text-sm text-slate-600">Configure your restaurant's settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleResetToDefaults}>
                Reset to Defaults
              </Button>
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Settings Form */}
      <Card className="h-96">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-slate-600" />
                <h3 className="text-md font-semibold">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name (English)</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., Maui Restaurant"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_es">Restaurant Name (Spanish)</Label>
                  <Input
                    id="name_es"
                    value={settings.name_es}
                    onChange={(e) => setSettings({...settings, name_es: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., Restaurante Maui"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., 123 Main Street, City, State 12345"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., info@restaurant.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => setSettings({...settings, website: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., https://restaurant.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    disabled={!editing}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    {currencies.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-600" />
                <h3 className="text-md font-semibold">Business Configuration</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.01"
                      value={settings.tax_rate}
                      onChange={(e) => setSettings({...settings, tax_rate: e.target.value})}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="8.25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_fee">Service Fee ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="service_fee"
                      type="number"
                      step="0.01"
                      value={settings.service_fee}
                      onChange={(e) => setSettings({...settings, service_fee: e.target.value})}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_wait_time">Max Wait Time (minutes)</Label>
                  <Input
                    id="max_wait_time"
                    type="number"
                    value={settings.max_wait_time}
                    onChange={(e) => setSettings({...settings, max_wait_time: e.target.value})}
                    disabled={!editing}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                <h3 className="text-md font-semibold">Feature Settings</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow_online_orders" className="text-sm font-medium">Online Orders</Label>
                      <p className="text-xs text-slate-500">Allow customers to place orders online</p>
                    </div>
                    <Switch
                      id="allow_online_orders"
                      checked={settings.allow_online_orders}
                      onCheckedChange={(checked) => setSettings({...settings, allow_online_orders: checked})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow_reservations" className="text-sm font-medium">Reservations</Label>
                      <p className="text-xs text-slate-500">Allow customers to make reservations</p>
                    </div>
                    <Switch
                      id="allow_reservations"
                      checked={settings.allow_reservations}
                      onCheckedChange={(checked) => setSettings({...settings, allow_reservations: checked})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow_table_requests" className="text-sm font-medium">Table Requests</Label>
                      <p className="text-xs text-slate-500">Allow customers to request table changes</p>
                    </div>
                    <Switch
                      id="allow_table_requests"
                      checked={settings.allow_table_requests}
                      onCheckedChange={(checked) => setSettings({...settings, allow_table_requests: checked})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable_notifications" className="text-sm font-medium">Notifications</Label>
                      <p className="text-xs text-slate-500">Enable push notifications</p>
                    </div>
                    <Switch
                      id="enable_notifications"
                      checked={settings.enable_notifications}
                      onCheckedChange={(checked) => setSettings({...settings, enable_notifications: checked})}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable_loyalty_program" className="text-sm font-medium">Loyalty Program</Label>
                      <p className="text-xs text-slate-500">Enable customer loyalty rewards</p>
                    </div>
                    <Switch
                      id="enable_loyalty_program"
                      checked={settings.enable_loyalty_program}
                      onCheckedChange={(checked) => setSettings({...settings, enable_loyalty_program: checked})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable_table_management" className="text-sm font-medium">Table Management</Label>
                      <p className="text-xs text-slate-500">Enable table management system</p>
                    </div>
                    <Switch
                      id="enable_table_management"
                      checked={settings.enable_table_management}
                      onCheckedChange={(checked) => setSettings({...settings, enable_table_management: checked})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable_kitchen_display" className="text-sm font-medium">Kitchen Display</Label>
                      <p className="text-xs text-slate-500">Enable kitchen order display</p>
                    </div>
                    <Switch
                      id="enable_kitchen_display"
                      checked={settings.enable_kitchen_display}
                      onCheckedChange={(checked) => setSettings({...settings, enable_kitchen_display: checked})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable_bar_display" className="text-sm font-medium">Bar Display</Label>
                      <p className="text-xs text-slate-500">Enable bar order display</p>
                    </div>
                    <Switch
                      id="enable_bar_display"
                      checked={settings.enable_bar_display}
                      onCheckedChange={(checked) => setSettings({...settings, enable_bar_display: checked})}
                      disabled={!editing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable_foh_display" className="text-sm font-medium">FOH Display</Label>
                      <p className="text-xs text-slate-500">Enable front-of-house display</p>
                    </div>
                    <Switch
                      id="enable_foh_display"
                      checked={settings.enable_foh_display}
                      onCheckedChange={(checked) => setSettings({...settings, enable_foh_display: checked})}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-slate-600" />
                <h3 className="text-md font-semibold">System Settings</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="qr_code_enabled" className="text-sm font-medium">QR Code Ordering</Label>
                    <p className="text-xs text-slate-500">Enable QR code table ordering</p>
                  </div>
                  <Switch
                    id="qr_code_enabled"
                    checked={settings.qr_code_enabled}
                    onCheckedChange={(checked) => setSettings({...settings, qr_code_enabled: checked})}
                    disabled={!editing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="demo_mode" className="text-sm font-medium">Demo Mode</Label>
                    <p className="text-xs text-slate-500">Enable demo mode for testing</p>
                  </div>
                  <Switch
                    id="demo_mode"
                    checked={settings.demo_mode}
                    onCheckedChange={(checked) => setSettings({...settings, demo_mode: checked})}
                    disabled={!editing}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
