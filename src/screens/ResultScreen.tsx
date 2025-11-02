import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { getDiseaseInfo } from '../data/bananaInfo';
import { Screen, Card, ConfidenceBar, StatChip } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import { t } from '../i18n';
import AppHeader from '../ui/AppHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { label, probability, imageUri, topK } = route.params;
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
      <Card style={{ marginHorizontal: spacing(2), marginBottom: spacing(1) }}>
        <Text style={{ color: colors.text, fontWeight: '800' }}>{t('diagnosis')}</Text>
      </Card>
      <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
        {imageUri && <Image source={{ uri: imageUri }} style={{ width: '100%', height: 240, borderRadius: 12, marginBottom: spacing(2) }} />}
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{info?.name ?? label}</Text>
        <View style={{ marginTop: spacing(1), marginBottom: spacing(1.5) }}>
          <ConfidenceBar value={probability} />
          <View style={{ height: spacing(1.5) }} />
          <StatChip label={`${t('confidence')} ${(probability * 100).toFixed(1)}%`} />
        </View>
        {topK && topK.length > 1 && (
          <Card>
            <Text style={{ marginTop: 0, fontSize: 16, fontWeight: '700', color: colors.text }}>{t('topPredictions')}</Text>
            {topK.slice(0, 3).map((r, i) => {
              const mapped = getDiseaseInfo(r.label);
              const name = mapped?.name ?? r.label;
              return (
                <Text key={i} style={{ marginTop: 6, lineHeight: 20, color: colors.textMuted }}>#{i + 1} {name} - {(r.probability * 100).toFixed(1)}%</Text>
              );
            })}
          </Card>
        )}
        {info && (
          <Card style={{ marginTop: spacing(2) }}>
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '700', color: colors.text }}>{t('symptoms')}</Text>
            {info.symptoms.map((s, i) => (
              <Text key={i} style={{ marginTop: 6, lineHeight: 20, color: colors.textMuted }}>• {s}</Text>
            ))}
            <View style={{ height: spacing(1) }} />
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '700', color: colors.text }}>{t('treatment')}</Text>
            {info.treatment.map((t, i) => (
              <Text key={i} style={{ marginTop: 6, lineHeight: 20, color: colors.textMuted }}>• {t}</Text>
            ))}
          </Card>
        )}
        <View style={{ height: spacing(2) }} />
        <TouchableOpacity style={{ marginTop: spacing(2), backgroundColor: '#146E43', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} onPress={() => navigation.navigate('Home')}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{t('backToHome')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({});
