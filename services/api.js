// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// Function to set JWT token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Authentication service
export const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}token/`, { username, password });
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      setAuthToken(response.data.access);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthToken(null);
  },
  
  register: async (userData) => {
    return await axios.post(`${API_URL}users/`, userData);
  },
  
  getCurrentUser: async () => {
    // Implement a me endpoint or get user from token
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuthToken(token);
      // You would need a /me endpoint in your API to get current user details
      // For now, let's assume we have a JWT decoder function
      // and we'll make a request to get user details
      return await axios.get(`${API_URL}users/`);
    }
    return null;
  }
};

// Applications service
export const applicationService = {
  getAll: async () => {
    return await axios.get(`${API_URL}applications/`);
  },
  
  getById: async (id) => {
    return await axios.get(`${API_URL}applications/${id}/`);
  },
  
  create: async (data) => {
    return await axios.post(`${API_URL}applications/`, data);
  },
  
  update: async (id, data) => {
    return await axios.put(`${API_URL}applications/${id}/`, data);
  },
  
  delete: async (id) => {
    return await axios.delete(`${API_URL}applications/${id}/`);
  }
};

// Access Requests service
export const accessRequestService = {
  getAll: async () => {
    return await axios.get(`${API_URL}access-requests/`);
  },
  
  getById: async (id) => {
    return await axios.get(`${API_URL}access-requests/${id}/`);
  },
  
  create: async (data) => {
    return await axios.post(`${API_URL}access-requests/`, data);
  },
  
  approve: async (id, comments) => {
    return await axios.post(`${API_URL}access-requests/${id}/approve/`, { comments });
  },
  
  reject: async (id, comments) => {
    return await axios.post(`${API_URL}access-requests/${id}/reject/`, { comments });
  }
};

// User Access service
export const userAccessService = {
  getAll: async () => {
    return await axios.get(`${API_URL}user-accesses/`);
  },
  
  revoke: async (id) => {
    return await axios.post(`${API_URL}user-accesses/${id}/revoke/`);
  }
};

// Set token on app initialization
const token = localStorage.getItem('accessToken');
if (token) {
  setAuthToken(token);
}