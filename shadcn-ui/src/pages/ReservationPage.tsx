import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Clock, Check } from 'lucide-react';
import { mockRestaurants, mockTables } from '../data/mockData';
import { useTranslation } from '../lib/translations';

interface ReservationPageProps {
  language: string;
}

const ReservationPage: React.FC<ReservationPageProps> = ({ language }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const t = useTranslation(language);

  const restaurant = mockRestaurants.find(r => r.id === id);
  const tables = mockTables[id || ''] || [];

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.error}</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-blue-600 hover:text-blue-800"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const availableTables = tables.filter(table => 
    table.isAvailable && table.capacity >= partySize
  );

  const timeSlots = [
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', 
    '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ];

  const handleConfirmReservation = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      navigate('/restaurants');
    }, 3000);
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.reservationConfirmed}</h2>
          <p className="text-gray-600 mb-4">
            {restaurant.name} - {selectedDate} at {selectedTime}
          </p>
          <p className="text-sm text-gray-500">
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center">
        <button
          onClick={() => navigate(`/restaurant/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 ml-3">
          {t.makeReservation} - {restaurant.name}
        </h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Step 1: Party Size */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {t.partySize}
            </h2>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
              >
                -
              </button>
              <span className="text-2xl font-semibold text-gray-800 min-w-[60px] text-center">
                {partySize} {partySize === 1 ? t.person : t.people}
              </span>
              <button
                onClick={() => setPartySize(partySize + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
              >
                +
              </button>
            </div>
            
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t.next}
            </button>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {t.selectDate}
            </h2>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {t.back}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Time Selection */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {t.selectTime}
            </h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    selectedTime === time
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {t.back}
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!selectedTime}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Table Selection */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t.availableTables}
            </h2>
            
            <div className="space-y-3 mb-6">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedTable === table.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {t.tableFor} {table.capacity} {table.capacity === 1 ? t.person : t.people}
                      </p>
                      <p className="text-sm text-gray-600">{table.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{t.availableTables}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {t.back}
              </button>
              <button
                onClick={handleConfirmReservation}
                disabled={!selectedTable}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.confirmReservation}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;