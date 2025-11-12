import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Clock, Users, Check } from 'lucide-react';
import { Restaurant, Table } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

export default function Reservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [reservationData, setReservationData] = useState({
    date: '',
    time: '',
    partySize: 2,
    name: '',
    phone: '',
    email: ''
  });
  const [reservationConfirmed, setReservationConfirmed] = useState(false);

  useEffect(() => {
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    const savedTable = localStorage.getItem('selectedTable');
    
    if (savedRestaurant) setRestaurant(JSON.parse(savedRestaurant));
    if (savedTable) setSelectedTable(JSON.parse(savedTable));

    // Set default date and time
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const nextHour = currentHour + 1;
    const defaultTime = `${nextHour.toString().padStart(2, '0')}:00`;
    
    setReservationData(prev => ({
      ...prev,
      date: today,
      time: defaultTime
    }));
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setReservationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmReservation = () => {
    // In a real app, this would send data to backend
    setReservationConfirmed(true);
    
    // Clear saved table data
    localStorage.removeItem('selectedTable');
    
    setTimeout(() => {
      navigate(`/restaurant/${restaurant?.id}`);
    }, 3000);
  };

  if (reservationConfirmed) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Your table has been reserved for {reservationData.date} at {reservationData.time}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <p className="text-sm"><strong>Restaurant:</strong> {restaurant?.name}</p>
              <p className="text-sm"><strong>Table:</strong> #{selectedTable?.number} ({selectedTable?.seats} seats)</p>
              <p className="text-sm"><strong>Party Size:</strong> {reservationData.partySize}</p>
              <p className="text-sm"><strong>Name:</strong> {reservationData.name}</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting back to restaurant...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurant || !selectedTable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Reservation data not found</h2>
          <Button onClick={() => navigate('/restaurants')}>
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('makeReservation')}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Restaurant & Table Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reservation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900">{restaurant.name}</p>
                <p className="text-sm text-gray-600">{restaurant.address}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                  <span>Table #{selectedTable.number}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{selectedTable.seats} seats</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={reservationData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={reservationData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="partySize">Party Size</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInputChange('partySize', Math.max(1, reservationData.partySize - 1))}
                  disabled={reservationData.partySize <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{reservationData.partySize}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInputChange('partySize', Math.min(selectedTable.seats, reservationData.partySize + 1))}
                  disabled={reservationData.partySize >= selectedTable.seats}
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum {selectedTable.seats} people for this table
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={reservationData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={reservationData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={reservationData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Button 
          onClick={handleConfirmReservation}
          className="w-full h-12 text-lg"
          disabled={!reservationData.name || !reservationData.phone}
        >
          <Check className="w-5 h-5 mr-2" />
          {t('confirm')} Reservation
        </Button>
      </div>
    </div>
  );
}