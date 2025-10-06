import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, DollarSign } from 'lucide-react';
import Navigation from '@/components/Navigation';
import BookingModal from '@/components/BookingModal';
import type { ServiceWithExpert } from '../../shared/types';
import { useAuth } from '@/providers/AuthProvider';
import { serviceService } from '@/services/serviceService';

export default function ServicesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceWithExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceWithExpert | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAllServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: ServiceWithExpert) => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('navigation.services')}</h1>
          <p className="text-gray-600 text-lg">Discover expert services tailored for you</p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services available yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center text-green-600 font-bold">
                      <DollarSign className="h-5 w-5" />
                      {service.price}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                  
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration} min
                    </div>
                    <div>with {service.expert_name}</div>
                  </div>
                  
                  <button
                    onClick={() => handleBookService(service)}
                    disabled={!user}
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {user ? t('booking.bookNow') : t('auth.loginWithGoogle')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}
