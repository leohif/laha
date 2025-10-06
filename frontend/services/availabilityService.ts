import { apiClient } from './api';
import { Availability, SetAvailability } from '../../shared/types';

export const availabilityService = {
  getExpertAvailability: (expertId: string) =>
    apiClient.get<Availability[]>(`/api/availability/${expertId}`),

  setAvailability: (data: SetAvailability) =>
    apiClient.post<{ success: boolean }>('/api/availability', data),
};
