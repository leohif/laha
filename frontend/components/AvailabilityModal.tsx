import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clock } from 'lucide-react';
import type { Availability } from '../../shared/types';
import { availabilityService } from '@/services/availabilityService';

interface AvailabilityModalProps {
  currentAvailability: Availability[];
  onClose: () => void;
  onSaved: () => void;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

export default function AvailabilityModal({ currentAvailability, onClose, onSaved }: AvailabilityModalProps) {
  const { t } = useTranslation();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    { value: 1, label: t('days.monday') },
    { value: 2, label: t('days.tuesday') },
    { value: 3, label: t('days.wednesday') },
    { value: 4, label: t('days.thursday') },
    { value: 5, label: t('days.friday') },
    { value: 6, label: t('days.saturday') },
    { value: 0, label: t('days.sunday') },
  ];

  useEffect(() => {
    // Initialize availability with existing data or defaults
    const initialAvailability = daysOfWeek.map(day => {
      const existing = currentAvailability.find(a => a.day_of_week === day.value);
      return {
        day_of_week: day.value,
        start_time: existing?.start_time || '09:00',
        end_time: existing?.end_time || '17:00',
        enabled: !!existing,
      };
    });
    setAvailability(initialAvailability);
  }, [currentAvailability]);

  const handleToggleDay = (dayIndex: number) => {
    setAvailability(prev => prev.map((slot, index) => 
      index === dayIndex ? { ...slot, enabled: !slot.enabled } : slot
    ));
  };

  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev => prev.map((slot, index) => 
      index === dayIndex ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const enabledSlots = availability.filter(slot => slot.enabled);

    setLoading(true);
    try {
      await availabilityService.setAvailability({
        availability: enabledSlots.map(slot => ({
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
        }))
      });
      onSaved();
    } catch (error) {
      console.error('Error saving availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            {t('expert.setAvailability')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-6">{t('expert.selectDays')}</p>
          
          <div className="space-y-4">
            {availability.map((slot, index) => (
              <div
                key={slot.day_of_week}
                className={`border rounded-lg p-4 transition-all ${
                  slot.enabled ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={() => handleToggleDay(index)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">
                      {daysOfWeek[index].label}
                    </span>
                  </label>
                </div>

                {slot.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <select
                        value={slot.start_time}
                        onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {timeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <select
                        value={slot.end_time}
                        onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {timeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !availability.some(slot => slot.enabled)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
