import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function getDefaultBaseUrl() {
  // Emulator defaults: Android uses 10.0.2.2 to reach host; iOS simulator can use localhost
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://127.0.0.1:8080';
}

export function resolveBaseUrl(override?: string) {
  const anyConst = Constants as any;
  const fromExpoConfig = anyConst?.expoConfig?.extra?.API_BASE_URL as string | undefined;
  const fromManifest2 = anyConst?.manifest2?.extra?.API_BASE_URL as string | undefined;
  const fromManifest = anyConst?.manifest?.extra?.API_BASE_URL as string | undefined;
  const fromExtra = override || fromExpoConfig || fromManifest2 || fromManifest;
  return fromExtra || getDefaultBaseUrl();
}

export function resolveModelQuery() {
  const anyConst = Constants as any;
  const model = anyConst?.expoConfig?.extra?.API_MODEL
    || anyConst?.manifest2?.extra?.API_MODEL
    || anyConst?.manifest?.extra?.API_MODEL
    || anyConst?.expoConfig?.extra?.MODEL_NAME
    || anyConst?.manifest?.extra?.MODEL_NAME;
  if (!model) return '';
  const q = encodeURIComponent(String(model));
  return `?model=${q}`;
}
