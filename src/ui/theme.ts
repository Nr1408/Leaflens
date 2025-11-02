export type ColorPalette = {
  bg: string;
  bg2: string; // secondary background for gradients
  bgAlt: string;
  surface: string;
  card: string;
  primary: string;
  primaryDark: string;
  highlight: string;
  warning: string;
  danger: string;
  success: string;
  text: string;
  textMuted: string;
  divider: string;
};

const lightPalette: ColorPalette = {
  bg: '#F4FBF7',
  bg2: '#EAF7F0',
  bgAlt: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  highlight: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  text: '#0A1F16',
  textMuted: '#3B6A5B',
  divider: 'rgba(0,0,0,0.08)',
};

const darkPalette: ColorPalette = {
  bg: '#0B1412',
  bg2: '#0E1916',
  bgAlt: '#0F1E1A',
  surface: '#0F1E1A',
  card: '#12231E',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  highlight: '#34D399',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  text: '#E7F3EE',
  textMuted: '#9FC8B9',
  divider: 'rgba(255,255,255,0.08)',
};

export const colors: ColorPalette = { ...lightPalette };

export type ThemeMode = 'light' | 'dark';

export function applyThemeMode(mode: ThemeMode) {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  Object.assign(colors, palette);
}

export const typography = {
  heading1: { fontSize: 28, fontWeight: '800' as const },
  heading2: { fontSize: 22, fontWeight: '700' as const },
  heading3: { fontSize: 18, fontWeight: '700' as const },
  subtitle: { fontSize: 14, fontWeight: '500' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};

export const spacing = (n: number) => n * 8;

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
};
