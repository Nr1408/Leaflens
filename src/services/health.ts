import { resolveBaseUrl } from '../config/api';

export async function pingApi(): Promise<boolean> {
  try {
    const base = resolveBaseUrl();
    const res = await fetch(`${base}/`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
