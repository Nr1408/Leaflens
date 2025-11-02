import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Screen, SettingRow, SectionCard } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import AppHeader from '../ui/AppHeader';
import { getSettings, LANGUAGES, updateSettings, THEMES } from '../services/settings';
import { setLanguage as setI18nLanguage, t } from '../i18n';
import { clearHistory } from '../services/history';

export type SettingsParams = {};

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [language, setLanguage] = useState<string>('English');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [theme, setTheme] = useState<'system'|'light'|'dark'>('system');
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setLanguage(s.language);
      setTheme((s as any).theme || 'system');
    })();
  }, []);
  return (
    <Screen>
      <AppHeader
        title={t('brand')}
        onHome={() => navigation.navigate('Home')}
        onCommunity={() => navigation.navigate('Community')}
        onHistory={() => navigation.navigate('History')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(8) }} showsVerticalScrollIndicator={false}>
        <SectionCard title={t('settings')} style={{ marginBottom: spacing(2) }}>
          <Text style={{ color: colors.textMuted }}>{t('settingsSubtitle')}</Text>
        </SectionCard>
        <SectionCard>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: spacing(0.5), marginBottom: spacing(1) }}>{t('preferences')}</Text>
          <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('theme')}</Text>
            <TouchableOpacity onPress={() => setThemeOpen(o => !o)} activeOpacity={0.8} style={{ borderWidth: 1, borderColor: colors.divider, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text }}>
                {theme === 'system' ? t('themeSystem') : theme === 'light' ? t('themeLight') : t('themeDark')}
              </Text>
              <Text style={{ color: colors.text }}>▾</Text>
            </TouchableOpacity>
            {themeOpen && (
              <View style={{ marginTop: 6, borderWidth: 1, borderColor: colors.divider, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.card }}>
                {THEMES.map((th, idx) => (
                  <TouchableOpacity key={th} onPress={async () => { await updateSettings({ theme: th } as any); setTheme(th); /* keep dropdown open so change is visible immediately */ }} activeOpacity={0.8} style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme === th ? '#DCF5E9' : colors.card, borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderColor: colors.divider }}>
                    <Text style={{ color: colors.text }}>{th === 'system' ? t('themeSystem') : th === 'light' ? t('themeLight') : t('themeDark')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ height: spacing(1) }} />
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('appLanguage')}</Text>
            <TouchableOpacity onPress={() => setLanguageOpen(o => !o)} activeOpacity={0.8} style={{ borderWidth: 1, borderColor: colors.divider, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text }}>{language}</Text>
              <Text style={{ color: colors.text }}>▾</Text>
            </TouchableOpacity>
            {languageOpen && (
              <View style={{ marginTop: 6, borderWidth: 1, borderColor: colors.divider, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.card }}>
                {LANGUAGES.map((l, idx) => (
                <TouchableOpacity key={l} onPress={async () => { setLanguage(l); setI18nLanguage(l as any); setLanguageOpen(false); await updateSettings({ language: l as any }); }} activeOpacity={0.8} style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: language === l ? '#DCF5E9' : colors.card, borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth, borderColor: colors.divider }}>
                    <Text style={{ color: colors.text }}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ height: spacing(1) }} />
          </View>

  <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: spacing(3), marginBottom: spacing(1) }}>{t('tools')}</Text>
          <View>
          <SettingRow title={t('clearHistory')} subtitle={t('clearHistorySub')} onPress={async () => { await clearHistory(); }} />
          <SettingRow title={t('sendToExpert')} subtitle="Share case with an agronomist" onPress={() => {}} />
          </View>
        </SectionCard>
  <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: spacing(3), marginBottom: spacing(1) }}>{t('about')}</Text>
        <SectionCard>
          <SettingRow title={t('appName')} subtitle="Smart Plant Disease Detection" />
          <SettingRow title={t('privacyPolicy')} onPress={() => Linking.openURL('https://example.com/privacy')} />
          <SettingRow title={t('version')} subtitle="0.1.0" />
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({});
