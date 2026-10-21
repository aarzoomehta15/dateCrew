/**
* Unified API Client for TDC Matchmaker CRM
*/


class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}


// Configurable API base URL: reads VITE_API_URL (or VITE_API_BASE_URL)
// Defaults to '/api' for local development via Vite proxy or same-domain production
const rawBaseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`)
  : '/api';


const TOKEN_STORAGE_KEY = 'tdc_auth_token';


export function getAuthToken() {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}


export function setAuthToken(token) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch { }
}


export function clearAuthToken() {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch { }
}


async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;


  const token = getAuthToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};


  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    credentials: 'include', // sends cookies for same-origin or CORS
    ...rest,
  };


  if (body) {
    config.body = JSON.stringify(body);
  }


  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_BASE}${cleanEndpoint}`, config);


  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }


  if (!res.ok) {
    const errorMsg = data?.error || res.statusText || 'Request failed';
    throw new ApiError(errorMsg, res.status, data?.details);
  }


  return data;
}


export const api = {
  // Auth
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } });
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },
  logout: async () => {
    try {
      return await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },
  getCurrentUser: () => request('/auth/me'),


  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),


  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request(`/customers${qs ? `?${qs}` : ''}`);
  },
  getCustomer: (id) => request(`/customers/${id}`),
  updateCustomer: (id, updates) => request(`/customers/${id}`, { method: 'PATCH', body: updates }),
  updateCustomerStatus: (id, status) => request(`/customers/${id}/status`, { method: 'PATCH', body: { status } }),


  // Notes
  getCustomerNotes: (customerId) => request(`/customers/${customerId}/notes`),
  addCustomerNote: (customerId, { content, type }) => request(`/customers/${customerId}/notes`, { method: 'POST', body: { content, type } }),


  // Matches
  getCustomerMatches: (customerId, filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request(`/customers/${customerId}/matches${qs ? `?${qs}` : ''}`);
  },
  recalculateMatches: (customerId, payload) => request(`/customers/${customerId}/matches/recalculate`, { method: 'POST', body: payload }),
  getMatchExplanation: (customerId, candidateId) => request('/matches/explain', { method: 'POST', body: { customerId, candidateId } }),
  sendMatch: (matchData) => request('/matches/send', { method: 'POST', body: matchData }),
  getSentMatches: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request(`/matches${qs ? `?${qs}` : ''}`);
  },
  updateSentMatchStatus: (matchId, status) => request(`/matches/${matchId}/status`, { method: 'PATCH', body: { status } }),


  // Activity
  getActivity: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request(`/activity${qs ? `?${qs}` : ''}`);
  },
};





