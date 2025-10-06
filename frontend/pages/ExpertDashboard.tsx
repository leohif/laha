import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar, DollarSign, Clock, Users } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ServiceModal from '@/components/ServiceModal';
import AvailabilityModal from '@/components/AvailabilityModal';
import type { Service, BookingWithDetails, Availability } from '../../shared/types';
import { useAuth } from '@/providers/AuthProvider';
import { serviceService } from '@/services/serviceService';
import { bookingService } from '@/services/bookingService';
import { availabilityService } from '@/services/availabilityService';

export default function ExpertDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [servicesData, bookingsData, availabilityData] = await Promise.all([
        serviceService.getExpertServices(user.id),
        bookingService.getExpertBookings(),
        availabilityService.getExpertAvailability(user.id)
      ]);

      setServices(servicesData);
      setBookings(bookingsData);
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await serviceService.deleteService(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleServiceSaved = () => {
    setShowServiceModal(false);
    setEditingService(null);
    fetchData();
  };

  const handleAvailabilitySaved = () => {
    setShowAvailabilityModal(false);
    fetchData();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('expert.dashboard')}</h1>
          <p className="text-gray-600">Manage your services and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{t('expert.bookings')}</h3>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">
                  ${services.reduce((total, service) => total + service.price, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{t('expert.services')}</h3>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowServiceModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('expert.addService')}
          </button>
          
          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
          >
            <Clock className="mr-2 h-5 w-5" />
            {t('expert.setAvailability')}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">{t('expert.services')}</h2>
            
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('expert.noServices')}</p>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {service.price}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.duration} min
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setShowServiceModal(true);
                          }}
                          className="px-3 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">{t('expert.bookings')}</h2>
            
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900">{booking.service_name}</h3>
                    <p className="text-sm text-gray-600">with {booking.user_name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {booking.booking_date}
                      </div>
                      <div>{booking.booking_time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showServiceModal && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
          onSaved={handleServiceSaved}
        />
      )}

      {showAvailabilityModal && (
        <AvailabilityModal
          currentAvailability={availability}
          onClose={() => setShowAvailabilityModal(false)}
          onSaved={handleAvailabilitySaved}
        />
      )}
    </div>
  );
}
