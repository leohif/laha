import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useUserRole } from '@/providers/UserRoleProvider';
import { Calendar, Star, Users, Globe } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const user = null;
  const { userRole } = useUserRole();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex gap-2">
          {[ 'en', 'es', 'fr'].map((lng) => (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                i18n.language === lng
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {userRole === 'expert' ? (
                  <Link
                    to="/expert/dashboard"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {t('navigation.dashboard')}
                  </Link>
                ) : (
                  <Link
                    to="/services"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Star className="mr-2 h-5 w-5" />
                    {t('home.findExperts')}
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Users className="mr-2 h-5 w-5" />
                  {t('navigation.profile')}
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-6">{t('auth.welcome')}</p>
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-4">{t('auth.chooseRole')}</h3>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <p className="font-medium">{t('auth.iAmUser')}</p>
                    </div>
                    <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 cursor-pointer transition-colors">
                      <p className="font-medium">{t('auth.iAmExpert')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Laha?</h2>
            <p className="text-gray-600 text-lg">Connect with verified professionals worldwide</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Experts</h3>
              <p className="text-gray-600">All professionals are thoroughly vetted and verified</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Book appointments with just a few clicks</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-600">Available in multiple languages worldwide</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
