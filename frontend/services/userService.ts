import { apiClient } from './api';
import { UserRole } from '../../shared/types';

export const userService = {
  getUserRole: () => apiClient.get<{ role: UserRole }>('/api/users/role'),

  setUserRole: (role: UserRole) =>
    apiClient.put<{ role: UserRole }>('/api/users/role', { role }),
};
