/*
  AppHeader
  - Compact top bar with brand and quick nav icons (home, community, history, profile).
*/
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoMark from './LogoMark';
import { colors, spacing, shadow } from './theme';
import { t } from '../i18n';

type Props = {
  title?: string;
  onHome: () => void;
  onCommunity: () => void;
  onHistory: () => void;
  onProfile: () => void;
};

export default function AppHeader({ title, onHome, onCommunity, onHistory, onProfile }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgAlt, paddingHorizontal: spacing(2), paddingVertical: spacing(1.5), borderRadius: 16, marginBottom: spacing(2), ...shadow }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <LogoMark size={28} />
  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20 }}>{title || t('brand')}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* Simple tappable icons instead of full Buttons to keep it minimal */}
        <Text onPress={onHome}>
          <Ionicons name="home-outline" size={22} color={colors.text} />
        </Text>
        <Text onPress={onCommunity}>
          <Ionicons name="people-outline" size={22} color={colors.text} />
        </Text>
        <Text onPress={onHistory}>
          <Ionicons name="time-outline" size={22} color={colors.text} />
        </Text>
        <Text onPress={onProfile}>
          <Ionicons name="person-circle-outline" size={22} color={colors.text} />
        </Text>
      </View>
    </View>
  );
}
