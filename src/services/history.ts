import AsyncStorage from '@react-native-async-storage/async-storage';

export type DiagnosisItem = {
  id: string;
  label: string;
  probability: number;
  imageUri?: string;
  at: number;
};

const KEY = 'leaflens.history.v1';

export async function addDiagnosis(item: Omit<DiagnosisItem, 'id' | 'at'>) {
  const all = await getHistory();
  const next: DiagnosisItem = { id: `${Date.now()}`, at: Date.now(), ...item };
  const merged = [next, ...all].slice(0, 5);
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}

export async function getHistory(): Promise<DiagnosisItem[]> {
  try {
    const s = await AsyncStorage.getItem(KEY);
    return s ? (JSON.parse(s) as DiagnosisItem[]) : [];
  } catch {
    return [];
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
