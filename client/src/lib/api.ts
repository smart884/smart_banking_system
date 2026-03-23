import axios from 'axios'

/**
 * Central API Service
 * All frontend-to-backend communication goes through here.
 */

export function getToken() {
  return localStorage.getItem('sb_token') || ''
}

const api = axios.create({ 
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Automatically attach Bearer token to every request
api.interceptors.request.use(cfg => {
  const token = getToken()
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
}, error => {
  return Promise.reject(error)
})

// Handle global API errors (e.g., token expiration)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect if needed
      console.warn("Unauthorized access detected. Logging out...");
      // localStorage.removeItem('sb_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error)
  }
)

/**
 * Authentication API
 */
export const authApi = {
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}

/**
 * User Management API
 */
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  getAllUsers: () => api.get('/users/all'),
  updateStatus: (uid: string, status: string) => api.patch('/users/status', { uid, status }),
}

/**
 * Transactions API
 */
export const transactionApi = {
  transfer: (data: { recipientEmail: string, amount: number, description?: string }) => 
    api.post('/transactions/transfer', data),
  getHistory: () => api.get('/transactions/history'),
}

export default api
