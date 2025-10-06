import { apiClient } from './api';
import { BookingWithDetails, CreateBooking, Booking } from '../../shared/types';

export const bookingService = {
  getExpertBookings: () =>
    apiClient.get<BookingWithDetails[]>('/api/bookings/expert'),

  getUserBookings: () =>
    apiClient.get<BookingWithDetails[]>('/api/bookings/user'),

  createBooking: (data: CreateBooking) =>
    apiClient.post<Booking>('/api/bookings', data),

  cancelBooking: (id: number) =>
    apiClient.delete<{ success: boolean }>(`/api/bookings/${id}`),

  getAvailableSlots: (expertId: string, serviceId: number, date: string) =>
    apiClient.get<string[]>(`/api/availability/${expertId}/${serviceId}/${date}`),
};
