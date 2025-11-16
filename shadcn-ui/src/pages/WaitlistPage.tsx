import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Coffee } from 'lucide-react';
import { mockRestaurants } from '../data/mockData';
import { useTranslation } from '../lib/translations';

interface WaitlistPageProps {
  language: string;
}

const WaitlistPage: React.FC<WaitlistPageProps> = ({ language }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  const [position, setPosition] = useState(12);
  const [estimatedWait, setEstimatedWait] = useState(35);
  const [partySize, setPartySize] = useState(2);
  const t = useTranslation(language);

  const restaurant = mockRestaurants.find(r => r.id === id);

  useEffect(() => {
    if (isJoined) {
      const interval = setInterval(() => {
        setPosition(prev => Math.max(1, prev - 1));
        setEstimatedWait(prev => Math.max(5, prev - 2));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isJoined]);

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

  const handleJoinWaitlist = () => {
    setIsJoined(true);
  };

  const barMenuItems = [
    { name: 'Mezcal Old Fashioned', price: 185 },
    { name: 'House Margarita', price: 165 },
    { name: 'Craft Beer', price: 85 },
    { name: 'Wine Glass', price: 125 },
    { name: 'Appetizer Platter', price: 245 }
  ];

  const formatPrice = (price: number) => {
    if (restaurant.id === '1') {
      return `$${price} MXN`;
    }
    return `$${price}`;
  };

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
        <div className="ml-3">
          <h1 className="text-xl font-semibold text-gray-800">{restaurant.name}</h1>
          <p className="text-sm text-gray-600">{t.joinWaitlist}</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {!isJoined ? (
          /* Join Waitlist Form */
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.joinWaitlist}</h2>
              <p className="text-gray-600">
                {t.estimatedWait}: {restaurant.waitTime} {t.minutes}
              </p>
            </div>

            {/* Party Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.partySize}
              </label>
              <div className="flex items-center justify-center space-x-4">
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
            </div>

            <button
              onClick={handleJoinWaitlist}
              className="w-full bg-orange-600 text-white py-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              {t.joinWaitlist}
            </button>
          </div>
        ) : (
          /* Waitlist Status */
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {t.yourPosition}: #{position}
                </h2>
                <p className="text-gray-600">
                  {t.estimatedWait}: {estimatedWait} {t.minutes}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-blue-800 font-medium">
                  {position} {t.people} {t.inLine}
                </p>
              </div>
            </div>

            {/* Bar Menu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Coffee className="w-5 h-5 text-brown-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">{t.barMenu}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t.orderDrinks}
              </p>

              <div className="space-y-3">
                {barMenuItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-600 font-semibold">
                        {formatPrice(item.price)}
                      </span>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        {t.addToOrder}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/menu/${id}`)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {t.viewMenu}
              </button>
              <button
                onClick={() => navigate(`/restaurant/${id}`)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {t.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitlistPage;