// History screen
// Shows a simple list of previous diagnoses stored locally.
// Lets the user clear all entries.
import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, SectionCard } from '../ui/components';
import LogoMark from '../ui/LogoMark';
import { colors, spacing } from '../ui/theme';
import { getHistory, DiagnosisItem, clearHistory } from '../services/history';
import AppHeader from '../ui/AppHeader';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const [items, setItems] = React.useState<DiagnosisItem[]>([]);
  React.useEffect(() => {
    // Refresh history each time the screen gets focus so the list stays current.
    const sub = navigation.addListener('focus', async () => setItems(await getHistory()));
    return sub;
  }, [navigation]);
  return (
    <Screen>
      <AppHeader
        title={t('brand')}
        onHome={() => navigation.navigate('Home')}
        onCommunity={() => navigation.navigate('Community')}
        onHistory={() => navigation.navigate('History')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <SectionCard
        title={t('diagnosisHistory')}
        style={items.length > 0 ? { marginBottom: spacing(2) } : undefined}
        footer={items.length > 0 ? (
          <Text
            onPress={async () => { await clearHistory(); setItems([]); }}
            style={{ color: '#EF4444', fontWeight: '800', marginBottom: spacing(2) }}
          >
            {t('clearAll')}
          </Text>
        ) : undefined}
      >
        <Text style={{ color: colors.textMuted }}>{t('reviewAndClear')}</Text>
      </SectionCard>
      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 16, textAlign: 'center' }}>{t('noDiagnosesYetShort')}</Text>
        </View>
      ) : (
        <SectionCard>
          {items.map((h) => (
            <View key={h.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{h.label}</Text>
              <Text style={{ color: colors.textMuted }}>{(h.probability * 100).toFixed(1)}%</Text>
            </View>
          ))}
        </SectionCard>
      )}
    </Screen>
  );
}
