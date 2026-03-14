import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Trips
export const tripsApi = {
  create: (data: {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    travelerType: string;
    interests: string[];
    specialRequirements?: string;
  }) => api.post('/trips', data),
  getAll: () => api.get('/trips'),
  getById: (id: string) => api.get(`/trips/${id}`),
  generateItinerary: (id: string) => api.post(`/trips/${id}/generate`),
  getItinerary: (id: string) => api.get(`/trips/${id}/itinerary`),
  delete: (id: string) => api.delete(`/trips/${id}`),
};

// Flights
export const flightsApi = {
  search: (params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
  }) => api.get('/flights/search', { params }),
};

// Hotels
export const hotelsApi = {
  search: (params: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests?: number;
    budgetLevel?: string;
  }) => api.get('/hotels/search', { params }),
};

export default api;
