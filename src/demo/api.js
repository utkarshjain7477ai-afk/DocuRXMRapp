import * as FileSystem from 'expo-file-system/legacy';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://prescriva-production.up.railway.app';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'kejnciuiejner34lnf';

const headers = (extra = {}) => ({ 'X-API-Key': API_KEY, ...extra });

const TIMEOUT_TEXT = 60000;
const TIMEOUT_AUDIO = 120000;

async function fetchT(url, opts = {}, ms = TIMEOUT_TEXT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function uploadAudio(uri, language = 'en') {
  const ext = uri.split('.').pop()?.toLowerCase() || 'm4a';
  const mime = ext === 'wav' ? 'audio/wav' : ext === 'caf' ? 'audio/x-caf' : ext === '3gp' ? 'audio/3gpp' : 'audio/mp4';
  const result = await FileSystem.uploadAsync(`${BASE}/transcribe-audio`, uri, {
    httpMethod: 'POST',
    uploadType: 1,
    fieldName: 'file',
    mimeType: mime,
    parameters: { language },
    headers: headers(),
    timeoutIntervalForRequest: TIMEOUT_AUDIO / 1000,
  });
  if (result.status < 200 || result.status >= 300) throw new Error(result.body || `Upload failed ${result.status}`);
  return (JSON.parse(result.body).text || '');
}

export async function structureTranscript(text, language = 'english') {
  return fetchT(`${BASE}/structure`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ text, language }),
  });
}

export async function generatePrescription({ transcript, symptoms, diagnosis, medications, tests = [] }) {
  const data = await fetchT(`${BASE}/generate-prescription`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ transcript, symptoms, diagnosis, medications, tests, language: 'english' }),
  }, TIMEOUT_TEXT);
  return data.prescription || '';
}
