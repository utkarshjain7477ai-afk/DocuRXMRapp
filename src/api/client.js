import Constants from 'expo-constants';

const BASE = Constants.expoConfig?.extra?.apiUrl ?? 'https://prescriva-production.up.railway.app';
const TIMEOUT = 15000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}${path}`, { ...options, signal: controller.signal });
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
  return request('/mr/self-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  });
}

export async function onboardDoctor(payload) {
  return request('/mr/onboard-doctor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function fetchMyLeads(agentCode) {
  return request(`/mr/my-leads?agent_code=${encodeURIComponent(agentCode)}`);
}

export async function confirmSubscription(referralCode) {
  return request('/mr/confirm-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referral_code: referralCode }),
  });
}

export function pingAppOpen(agentCode) {
  // Fire-and-forget — don't await, don't surface errors to user
  request('/mr/app-open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_code: agentCode }),
  }).catch(() => {});
}
