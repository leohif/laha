import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Settings, BookOpen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import type { BookingWithDetails } from '../../shared/types';
import { useAuth } from '@/providers/AuthProvider';
import { bookingService } from '@/services/bookingService';
import { userService } from '@/services/userService';

export default function UserProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'user' | 'expert' | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [roleData, bookingsData] = await Promise.all([
        userService.getUserRole(),
        bookingService.getUserBookings()
      ]);
      setUserRole(roleData.role);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  const handleRoleChange = async (newRole: 'user' | 'expert') => {
    try {
      await userService.setUserRole(newRole);
      setUserRole(newRole);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center pt-32">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Please log in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.email}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  userRole === 'expert' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userRole === 'expert' ? 'Expert' : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.chooseRole')}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => handleRoleChange('user')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    userRole === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('auth.iAmUser')}
                </button>
                <button
                  onClick={() => handleRoleChange('expert')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    userRole === 'expert'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('auth.iAmExpert')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('user.myBookings')}
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('user.noBookings')}</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.service_name}</h3>
                      <p className="text-sm text-gray-600">
                        {t('user.bookingWith')} {booking.expert_name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {booking.booking_date}
                        </div>
                        <div>{booking.booking_time}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      {t('user.cancelBooking')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
