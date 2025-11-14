// Landing (marketing) screen
// In plain words: This is the first screen new users see.
// It shows the brand, a short pitch, three feature cards,
// and a big call-to-action that sends people to Login.
// No data is loaded here; it’s all static copy + images.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, Title, Subtitle, PrimaryButton, Card } from '../ui/components';
import LogoMark from '../ui/LogoMark';
import { colors, spacing } from '../ui/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingNew({ navigation }: Props) {
  // We wrap everything in our shared <Screen> which handles safe areas
  // and background color so every page looks consistent.
  return (
    <Screen>
      {/* Scrollable container so the content fits on small phones too */}
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }} showsVerticalScrollIndicator={false}>
        {/* Brand row: small logo + product name */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing(2) }}>
          <LogoMark size={28} />
          <Text style={styles.brand}>{t('brand')}</Text>
        </View>
        {/* Hero section: tagline + short description + primary buttons */}
        <View style={styles.hero}>
          <Text style={styles.pill}>{t('aiPoweredPlantHealth')}</Text>
          <View style={{ height: spacing(1.5) }} />
          <Title>
            <Text style={styles.h1}>{t('protectYourPlantsWith')+"\n"}</Text>
            <Text style={[styles.h1, { color: colors.highlight }]}>{t('brand')}</Text>
          </Title>
          <Subtitle>
            {t('advancedAIMeets')}
          </Subtitle>
          {/* Both buttons currently go to Login. You could swap one to a Learn More route later. */}
          <PrimaryButton title={t('getStartedFree')} onPress={() => navigation.navigate('Login')} />
          <View style={{ height: spacing(1) }} />
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Login')} style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>{t('learnMoreCta')}</Text>
          </TouchableOpacity>
        </View>
          {/* Static hero image below the headline */}
          <Image
            source={require('../../assets/img/landing-hero.jpg')}
            style={styles.heroImage}
          />
        <View style={{ height: spacing(2) }} />
  <Text style={styles.sectionHeading}>{`${t('whyChoose')} ${t('brand')}?`}</Text>
        <View style={{ height: spacing(2) }} />
        {/* Three simple value props with icons */}
        <Card style={{ padding: spacing(2) }}>
          <View style={styles.featureRow}>
            <View style={styles.iconPill}><Ionicons name="camera-outline" size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{t('instantDetection')}</Text>
              <Text style={styles.featureText}>{t('instantDetectionDesc')}</Text>
            </View>
          </View>
        </Card>
        <View style={{ height: spacing(1) }} />
        <Card style={{ padding: spacing(2) }}>
          <View style={styles.featureRow}>
            <View style={styles.iconPill}><Ionicons name="medkit-outline" size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{t('expertTreatmentPlans')}</Text>
              <Text style={styles.featureText}>{t('expertTreatmentPlansDesc')}</Text>
            </View>
          </View>
        </Card>
        <View style={{ height: spacing(1) }} />
        <Card style={{ padding: spacing(2) }}>
          <View style={styles.featureRow}>
            <View style={styles.iconPill}><Ionicons name="trending-up-outline" size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{t('trackProgress')}</Text>
              <Text style={styles.featureText}>{t('trackProgressDesc')}</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: spacing(3) }} />
        {/* Bottom call-to-action with a subtle gradient background */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>{t('readyToProtect')}</Text>
          <Text style={styles.ctaSub}>{t('joinThousands')}</Text>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Login')} style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>{t('startDiagnosingNow')}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Styles here lean on our shared theme tokens for consistent spacing/colors.
  // No extra badge wrapper; LogoMark renders its own rounded tile
  brand: { color: colors.text, fontWeight: '800', fontSize: 22 },
  pill: { alignSelf: 'flex-start', backgroundColor: '#18473D', color: '#BFE8D7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontWeight: '700', fontSize: 12 },
  hero: { marginBottom: spacing(2) },
  h1: { color: colors.text, fontSize: 32, fontWeight: '900', lineHeight: 38 },
  outlineBtn: { borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.bgAlt, paddingVertical: spacing(1.75), borderRadius: 12, alignItems: 'center' },
  outlineBtnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  heroImage: { width: '100%', height: 165, borderRadius: 16, backgroundColor: colors.bgAlt },
  sectionHeading: { color: colors.text, fontSize: 20, fontWeight: '800' },
  featureTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  featureText: { color: colors.textMuted, fontSize: 14 },
  featureRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconPill: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  ctaCard: { borderRadius: 20, padding: spacing(2) },
  ctaTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  ctaSub: { color: '#E6FFF3', marginTop: 6 },
  ctaBtn: { alignSelf: 'flex-start', backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginTop: spacing(2) },
  ctaBtnText: { color: colors.primaryDark, fontWeight: '800' },
});
