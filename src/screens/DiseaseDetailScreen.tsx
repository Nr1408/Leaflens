// Disease details screen
// Purpose: Show extra information for a specific disease label including
// confidence (if provided), symptoms, and treatment suggestions.
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, SectionCard } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import { t } from '../i18n';
import { getDiseaseInfo } from '../data/bananaInfo';
import AppHeader from '../ui/AppHeader';

export type DiseaseDetailParams = { label: string; probability?: number };

type Props = NativeStackScreenProps<RootStackParamList, 'DiseaseDetail'>;

export default function DiseaseDetailScreen({ route, navigation }: Props) {
  const { label, probability } = route.params;
  // Map raw label to a friendly info block (name, symptoms, treatment)
  const info = getDiseaseInfo(label);

  return (
    <Screen>
      <AppHeader
        title="Leaflens"
        onHome={() => navigation.navigate('Home')}
        onCommunity={() => navigation.navigate('Community')}
        onHistory={() => navigation.navigate('History')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <SectionCard title={info?.name || label}>
        <Text style={{ color: colors.textMuted }}>{t('learnMore')}</Text>
      </SectionCard>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(6) }} showsVerticalScrollIndicator={false}>
        {/* Big initial letter badge (simple visual) */}
        <View style={[base.heroCircle, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontSize: 42, fontWeight: '800' }}>{(info?.name || label).charAt(0)}</Text>
        </View>
        {probability != null && (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: spacing(1) }}>{t('confidence')} {(probability * 100).toFixed(1)}%</Text>
        )}
        {/* If description field is later added to bananaDiseaseLibrary entries we can display it here. */}
        {info && (
          <SectionCard title={t('symptoms')} style={{ marginTop: spacing(2) }}>
            {info.symptoms.map((s, i) => (
              <Text key={i} style={{ color: colors.textMuted, marginTop: 6, lineHeight: 18 }}>• {s}</Text>
            ))}
          </SectionCard>
        )}
        {info && (
          <SectionCard title={t('treatment')} style={{ marginTop: spacing(2) }}>
            <Text style={{ color: colors.text, fontWeight: '600', marginTop: spacing(0.5) }}>{t('organic')}</Text>
            {info.treatment.filter(t => /organic/i.test(t)).map((t,i)=>(<Text key={'org'+i} style={{ color: colors.textMuted, marginTop: 6, lineHeight: 18 }}>• {t}</Text>))}
            <Text style={{ color: colors.text, fontWeight: '600', marginTop: spacing(1.5) }}>{t('chemical')}</Text>
            {info.treatment.filter(t => /spray|chemical|fungicide|icide/i.test(t)).map((t,i)=>(<Text key={'chem'+i} style={{ color: colors.textMuted, marginTop: 6, lineHeight: 18 }}>• {t}</Text>))}
            {info.treatment.length === 0 && <Text style={{ color: colors.textMuted, marginTop: 6, lineHeight: 18 }}>• {t('noData')}</Text>}
          </SectionCard>
        )}
      </ScrollView>
    </Screen>
  );
}

const base = StyleSheet.create({
  heroCircle: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: spacing(1) },
});
