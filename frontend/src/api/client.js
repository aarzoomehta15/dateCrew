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

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // sends cookies
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`/api${endpoint}`, config);

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
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
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
