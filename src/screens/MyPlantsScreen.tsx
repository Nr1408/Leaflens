// My Plants screen (placeholder)
// Shows a simple list of sample plants with a severity tag,
// plus some general care tips. Replace SAMPLE with real user data later.
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Screen, SectionCard, SeverityTag } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import AppHeader from '../ui/AppHeader';
import { t } from '../i18n';

interface PlantEntry { id: string; name: string; date: string; severity: 'low' | 'medium' | 'high'; }

const SAMPLE: PlantEntry[] = [
  { id: '1', name: 'Apple Scab', date: 'Apr 20', severity: 'low' },
  { id: '2', name: 'Early Blight', date: 'Apr 15', severity: 'high' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'MyPlants'>;

export default function MyPlantsScreen({ navigation }: Props) {
  const [plants] = useState(SAMPLE);
  return (
    <Screen>
      <AppHeader
        title={t('brand')}
        onHome={() => navigation.navigate('Home')}
        onCommunity={() => navigation.navigate('Community')}
        onHistory={() => navigation.navigate('History')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <SectionCard title={t('myPlants')}>
        <Text style={{ color: colors.textMuted }}>{t('trackPlantsTips')}</Text>
      </SectionCard>
      <FlatList
        data={plants}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: spacing(8) }}
        ListHeaderComponent={
          <SectionCard title={t('plantCareTips')} style={{ marginBottom: spacing(2) }}>
            <Text style={styles.tip}>{t('tipRemoveInfected')}</Text>
            <Text style={styles.tip}>{t('tipKeepFoliageDry')}</Text>
          </SectionCard>
        }
        renderItem={({ item }) => (
          <View style={styles.row}> 
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <SeverityTag level={item.severity} />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing(2), borderRadius: 18, marginBottom: spacing(1.25) },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  tip: { color: colors.textMuted, lineHeight: 18, marginTop: 4 },
});
