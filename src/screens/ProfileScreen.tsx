import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, SectionCard } from '../ui/components';
import { useAuth } from '../state/AuthContext';
import { colors, spacing } from '../ui/theme';
import AppHeader from '../ui/AppHeader';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  return (
    <Screen>
      <AppHeader
        title={t('brand')}
        onHome={() => navigation.navigate('Home')}
        onCommunity={() => navigation.navigate('Community')}
        onHistory={() => navigation.navigate('History')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <SectionCard title={t('profile')} style={{ marginBottom: spacing(2) }}>
        <Text style={{ color: colors.textMuted }}>{t('manageAccount')}</Text>
      </SectionCard>
      <SectionCard>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing(1) }}>{t('accountInformation')}</Text>
        <Text style={{ color: colors.textMuted, marginBottom: spacing(2) }}>{t('yourPersonalDetails')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing(2) }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#DCF5E9', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#166534', fontSize: 28 }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{user?.username}</Text>
            <Text style={{ color: colors.textMuted }}>{user?.email}</Text>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: spacing(1) }} />
        <Text style={{ color: colors.text, fontWeight: '700', marginBottom: spacing(1) }}>{t('actions')}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing(1) }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Settings')} style={{ flex: 1, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.bgAlt, paddingVertical: spacing(1.75), borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('openSettings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} onPress={async () => { await logout(); }} style={{ flex: 1, backgroundColor: '#EF4444', paddingVertical: spacing(1.75), borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '800' }}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
        
      </SectionCard>
    </Screen>
  );
}
