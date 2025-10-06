import { apiClient } from './api';
import { ServiceWithExpert, CreateService, Service } from '../../shared/types';

export const serviceService = {
  getAllServices: () =>
    apiClient.get<ServiceWithExpert[]>('/api/services'),

  getExpertServices: (expertId: string) =>
    apiClient.get<Service[]>(`/api/experts/${expertId}/services`),

  createService: (data: CreateService) =>
    apiClient.post<Service>('/api/services', data),

  updateService: (id: number, data: CreateService) =>
    apiClient.put<Service>(`/api/services/${id}`, data),

  deleteService: (id: number) =>
    apiClient.delete<{ success: boolean }>(`/api/services/${id}`),
};
