/**
 * KaamAI backend API client (used by the React frontend).
 * Falls back to local state if the backend is unreachable (offline-first).
 */

const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => request('/health'),
  forecast: (body) => request('/forecast', { method: 'POST', body: JSON.stringify(body) }),
  dashboard: () => request('/dashboard'),
  inventory: () => request('/inventory'),
  shoppingList: () => request('/inventory/shopping-list', { method: 'POST' }),
  ledger: () => request('/ledger'),
  recordBill: (bill) => request('/ledger/bill', { method: 'POST', body: JSON.stringify(bill) }),
  copilot: (message, context) => request('/copilot', { method: 'POST', body: JSON.stringify({ message, context }) })
};

export default api;