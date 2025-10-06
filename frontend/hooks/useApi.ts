export const useApi = () => {
  const API_URL = import.meta.env.VITE_API_URL || '';

  const apiFetch = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  };

  return { apiFetch };
};