import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-inject JWT Bearer token if present in sessionStorage
api.interceptors.request.use(async (config) => {
  let token = sessionStorage.getItem('cp_auth_token');
  if (!token && !config.url?.includes('/auth/')) {
    try {
      // Auto-initialize demo persona token on first request
      const res = await axios.get(`${config.baseURL || 'http://localhost:8000/api/v1'}/auth/demo-token?role=OPERATIONS_DIRECTOR`);
      if (res.data?.access_token) {
        token = res.data.access_token;
        sessionStorage.setItem('cp_auth_token', token as string);
        if (res.data.user) {
          sessionStorage.setItem('cp_user', JSON.stringify(res.data.user));
        }
      }
    } catch {
      // Backend offline or unreachable
    }
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.warn('[API] Request failed, using deterministic fallback:', err.message);
    return Promise.reject(err);
  }
);

export default api;
