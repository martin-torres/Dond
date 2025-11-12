import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleNavigation = () => {
      try {
        // Check if language is already selected
        const selectedLanguage = localStorage.getItem('selectedLanguage');
        
        if (selectedLanguage) {
          // If language is selected, go directly to restaurants
          navigate('/restaurants', { replace: true });
        } else {
          // If no language selected, go to language selector
          navigate('/language', { replace: true });
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to language selector
        navigate('/language', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure proper mounting
    const timer = setTimeout(handleNavigation, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!isLoading) {
    return null; // Component will unmount after navigation
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">🍽️</span>
        </div>
        <p className="text-gray-600">Loading DineIn...</p>
      </div>
    </div>
  );
}