// Login screen
// Simple explanation: Let the user sign in with username/email + password
// or Google. Also provides a link to reset password.
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../state/AuthContext';
import { Screen, Title, Subtitle, Input, PrimaryButton, Card } from '../ui/components';
import LogoMark from '../ui/LogoMark';
import { colors, spacing } from '../ui/theme';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, resendVerification, signInWithGoogle, resetPassword } = useAuth();
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    // Try to sign in. We lower-case the identifier so email/username checks are consistent.
    const result = await login(identifier.trim().toLowerCase(), password);
    if (!result.ok) {
      // If email exists but not verified, offer to resend a verification email.
      if (result.code === 'unverified_email') {
        const email = result.email || identifier;
        return Alert.alert(
          t('verifyEmailTitle'),
          `${t('verifyEmailPrefix')}${email}${t('verifyEmailSuffix')}`,
          [
            { text: t('resendLink'), onPress: async () => {
                const ok = await resendVerification(email);
                Alert.alert(ok ? t('verificationSent') : t('resendFailed'), ok ? t('checkInbox') : t('tryAgain'));
              } },
            { text: t('ok') }
          ]
        );
      }
      // Show a friendly message for the most common login errors.
      const msg = result.code === 'not_found' ? t('usernameNotFound')
        : result.code === 'invalid_credentials' ? t('invalidCredentials')
        : result.message || t('loginFailed');
      return Alert.alert(t('loginFailed'), msg);
    }
  };

  const onForgotPassword = async () => {
    // Sends a password reset email if the identifier is a known email.
    const res = await resetPassword(identifier);
    if (!res.ok) return Alert.alert(t('resetPassword'), res.message || t('tryAgain'));
    Alert.alert(t('verificationSent'), t('checkInbox'));
  };

  const onGoogle = async () => {
    // Starts Google sign-in using the Supabase OAuth flow (PKCE).
    const ok = await signInWithGoogle();
    if (!ok) Alert.alert(t('googleSignInFailed'), t('tryAgain'));
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {/* Brand header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing(1) }}>
          <LogoMark size={36} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>{t('brand')}</Text>
        </View>
        {/* Small tagline under the brand */}
        <Subtitle>{t('loginTagline')}</Subtitle>
        {/* Credentials form */}
        <Input placeholder={t('usernameOrEmail')} value={identifier} onChangeText={setIdentifier} />
        <View style={{ height: spacing(1) }} />
        <Input placeholder={t('password')} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity onPress={onForgotPassword} style={{ alignSelf: 'flex-end', marginTop: spacing(0.5) }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('forgotPassword')}</Text>
        </TouchableOpacity>
        <View style={{ height: spacing(2) }} />
        <PrimaryButton title={t('login')} onPress={onLogin} />
        {/* Divider with OR */}
        <View style={{ marginVertical: spacing(2), flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider }} />
          <Text style={{ color: colors.textMuted, fontWeight: '600' }}>{t('orWord')}</Text>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider }} />
        </View>
        {/* Social login option */}
        <Card onPress={onGoogle} style={{ paddingVertical: spacing(1.25) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Ionicons name="logo-google" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('continueWithGoogle')}</Text>
          </View>
        </Card>
        {/* Link to registration screen */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing(2), alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted }}>{t('noAccount')} <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('register')}</Text></Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({});
