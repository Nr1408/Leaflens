import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'English' | 'Hindi' | 'Marathi';
export type ThemeSetting = 'system' | 'light' | 'dark';

export type AppSettings = {
  language: AppLanguage;
  notifications: boolean;
  dataSaver: boolean;
  theme: ThemeSetting;
};

const SETTINGS_KEY = 'leaflens.settings.v2';

const DEFAULTS: AppSettings = {
  language: 'English',
  notifications: true,
  dataSaver: false,
  theme: 'system',
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    // Try to migrate from v1 if exists
    const legacy = await AsyncStorage.getItem('leaflens.settings.v1');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as any;
        const migrated: AppSettings = { ...DEFAULTS, ...parsed, theme: 'system' };
        cache = migrated;
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
        return migrated;
      } catch {}
    }
    return DEFAULTS;
  }
  try {
    const parsed = JSON.parse(raw) as any;
    cache = { ...DEFAULTS, ...parsed } as AppSettings;
    return cache;
  } catch {
    cache = DEFAULTS;
    return cache;
  }
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const cur = cache || (await getSettings());
  const next = { ...cur, ...patch } as AppSettings;
  cache = next;
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  notify(next);
  return next;
}

export const LANGUAGES: AppLanguage[] = ['English', 'Hindi', 'Marathi'];
export const THEMES: ThemeSetting[] = ['system', 'light', 'dark'];

// --- lightweight change subscription for settings updates ---
let cache: AppSettings | null = null;
type Listener = (s: AppSettings) => void;
const listeners = new Set<Listener>();

export function getCachedSettings(): AppSettings | null {
  return cache;
}

export function subscribeSettings(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(s: AppSettings) {
  listeners.forEach(cb => {
    try { cb(s); } catch {}
  });
}
