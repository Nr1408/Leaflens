import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, Subtitle, Input, PrimaryButton } from '../ui/components';
import LogoMark from '../ui/LogoMark';
import { colors, spacing } from '../ui/theme';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../state/AuthContext';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onUpdate = async () => {
    if (password.length < 6) return Alert.alert(t('weakPassword4'), t('weakPassword6'));
    if (password !== confirm) return Alert.alert(t('passwordMismatch'), t('confirmPasswordMustMatch'));
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return Alert.alert(t('updateFailed'), error.message);
      Alert.alert(t('success'), t('passwordUpdated'), [
        { text: t('continue'), onPress: () => navigation.replace(user ? 'Home' : 'Login') }
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing(1) }}>
          <LogoMark size={36} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>{t('resetPassword')}</Text>
        </View>
        <Subtitle>{t('enterNewPassword')}</Subtitle>
        <Input placeholder={t('newPassword')} value={password} onChangeText={setPassword} secureTextEntry />
        <View style={{ height: spacing(1) }} />
        <Input placeholder={t('confirmNewPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry />
        <View style={{ height: spacing(2) }} />
        <PrimaryButton title={busy ? t('updating') : t('updatePassword')} onPress={onUpdate} disabled={busy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});
