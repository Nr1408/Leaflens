// Register screen
// Plain English: Create a new account with username, email, and password,
// or continue with Google. After successful sign-up we prompt user to log in.
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../state/AuthContext';
import { Screen, Title, Subtitle, Input, PrimaryButton, Card } from '../ui/components';
import LogoMark from '../ui/LogoMark';
import { colors, spacing } from '../ui/theme';
import { supabase } from '../services/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register, signInWithGoogle } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onRegister = async () => {
    // Basic input checks to keep feedback simple and quick.
    if (!username.trim()) return Alert.alert(t('missingUsername'), t('pleaseEnterUsername'));
    if (!email.trim()) return Alert.alert(t('missingEmail'), t('pleaseEnterEmail'));
    if (password.length < 4) return Alert.alert(t('weakPassword4'), t('useAtLeast4Chars'));
    if (password !== confirm) return Alert.alert(t('passwordMismatch'), t('confirmPasswordMustMatch'));
    // Ask the auth service to register the user.
    const res = await register(username.trim(), email.trim().toLowerCase(), password);
    if (!res.ok) {
      const title = res.code === 'username_taken' ? t('usernameTaken')
        : res.code === 'email_taken' ? t('emailRegistered')
        : res.code === 'auth_email_exists' ? t('emailInUse')
        : t('signUpFailed');
      return Alert.alert(title, res.message || t('tryDifferent'));
    }
    // Optional: start a quick sign-in then sign-out to ensure our profile upsert runs once.
    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (signInData?.session) {
        // Immediately sign out; we just needed the session to trigger profile ensure
        await supabase.auth.signOut();
      }
    } catch {}
    // Registration succeeded -> prompt to login
    Alert.alert(
      t('accountCreated'),
      t('youCanNowLogin'),
      [
        { text: t('goToLogin'), onPress: () => navigation.replace('Login') },
      ]
    );
  };

  const onGoogle = async () => {
    // Google sign-up/sign-in using Supabase OAuth (PKCE).
    const ok = await signInWithGoogle();
    if (!ok) Alert.alert(t('googleSignInFailed'), t('tryAgain'));
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {/* Simple brand header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing(1) }}>
          <LogoMark size={36} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>{t('createAccount')}</Text>
        </View>
        <Subtitle>{t('minuteToSignUp')}</Subtitle>
        {/* Registration form */}
        <Input placeholder={t('username')} value={username} onChangeText={setUsername} />
        <View style={{ height: spacing(1) }} />
        <Input placeholder={t('email')} value={email} onChangeText={setEmail} />
        <View style={{ height: spacing(1) }} />
        <Input placeholder={t('password')} value={password} onChangeText={setPassword} secureTextEntry />
        <View style={{ height: spacing(1) }} />
        <Input placeholder={t('confirmPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry />
        <View style={{ height: spacing(2) }} />
        <PrimaryButton title={t('register')} onPress={onRegister} />
        {/* Divider with OR */}
        <View style={{ marginVertical: spacing(2), flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider }} />
          <Text style={{ color: colors.textMuted, fontWeight: '600' }}>{t('orWord')}</Text>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider }} />
        </View>
        {/* Social sign-up option */}
        <Card onPress={onGoogle} style={{ paddingVertical: spacing(1.25) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Ionicons name="logo-google" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('continueWithGoogle')}</Text>
          </View>
        </Card>
        {/* Link back to Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing(2), alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted }}>{t('haveAccount')} <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('login')}</Text></Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({});
