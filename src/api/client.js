import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const BASE = Constants.expoConfig?.extra?.apiUrl ?? 'https://prescriva-production.up.railway.app';
const TIMEOUT = 15000;
const TOKEN_KEY = 'mr_session_token';

export async function saveToken(token) {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function authHeaders(extra = {}) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const h = { ...extra };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  const headers = auth ? await authHeaders() : {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function selfRegister(name, phone) {
  const data = await request('/mr/self-register', {
    method: 'POST',
    body: { name, phone },
    auth: false,
  });
  if (data?.token) await saveToken(data.token);
  return data;
}

export async function onboardDoctor(payload) {
  return request('/mr/onboard-doctor', { method: 'POST', body: payload });
}

export async function fetchMyLeads(agentCode) {
  return request(`/mr/my-leads?agent_code=${encodeURIComponent(agentCode)}`);
}

export async function confirmSubscription(referralCode) {
  return request('/mr/confirm-subscription', {
    method: 'POST',
    body: { referral_code: referralCode },
  });
}

export function pingAppOpen(agentCode) {
  request('/mr/app-open', { method: 'POST', body: { agent_code: agentCode } }).catch(() => {});
}
