import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, Title, Subtitle, PrimaryButton, Card } from '../ui/components';
import LogoMark from '../ui/LogoMark';
import { colors, spacing } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }} showsVerticalScrollIndicator={false}>
        {/* App bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing(2) }}>
          <LogoMark size={28} />
          <Text style={styles.brand}>Leaflens</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.pill}>AI-Powered Plant Health</Text>
          <View style={{ height: spacing(1.5) }} />
          <Title>
            <Text style={styles.h1}>Protect Your Plants with{'
'} </Text>
            <Text style={[styles.h1, { color: colors.primaryLight }]}>Leaflens</Text>
          <Title>
            <Text style={styles.h1}>Protect Your Plants with{"\n"}</Text>
            <Text style={[styles.h1, { color: colors.highlight }]}>Leaflens</Text>
          </Title>
          <PrimaryButton title="Get Started Free" onPress={() => navigation.navigate('Login')} />
        </View>

        {/* Feature cards (lightweight) */}
        <View style={{ height: spacing(2) }} />
        <Card>
          <Text style={styles.featureTitle}>Why Choose Leaflens?</Text>
          <View style={{ height: spacing(1) }} />
          <Text style={styles.featureText}>Advanced AI meets botanical expertise to keep your plants healthy.</Text>
          <View style={{ height: spacing(1.5) }} />
          <PrimaryButton title="Learn More" onPress={() => navigation.navigate('Login')} />
        </Card>

        <View style={{ height: spacing(2) }} />
        <Card>
          <Text style={styles.featureTitle}>Ready to Protect Your Plants?</Text>
          <View style={{ height: spacing(1) }} />
          <Text style={styles.featureText}>Join thousands of plant lovers using Leaflens to keep their gardens healthy.</Text>
          <View style={{ height: spacing(1.5) }} />
          <PrimaryButton title="Start Diagnosing Now" onPress={() => navigation.navigate('Login')} />
        </Card>
      import React from 'react';
      import { View, Text, ScrollView, StyleSheet } from 'react-native';
      import { NativeStackScreenProps } from '@react-navigation/native-stack';
      import { RootStackParamList } from '../navigation';
      import { Screen, Title, Subtitle, PrimaryButton, Card } from '../ui/components';
      import LogoMark from '../ui/LogoMark';
      import { colors, spacing } from '../ui/theme';

      type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

      export default function LandingScreen({ navigation }: Props) {
        return (
          <Screen>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }} showsVerticalScrollIndicator={false}>
              {/* App bar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing(2) }}>
                <View style={styles.logoBadge}><LogoMark size={24} /></View>
                <Text style={styles.brand}>Leaflens</Text>
              </View>

              {/* Hero */}
              <View style={styles.hero}>
                <Text style={styles.pill}>AI-Powered Plant Health</Text>
                <View style={{ height: spacing(1.5) }} />
                <Title>
                  <Text style={styles.h1}>Protect Your Plants with{"\n"}</Text>
                  <Text style={[styles.h1, { color: colors.highlight }]}>Leaflens</Text>
                </Title>
                <Subtitle>
                  Instantly detect plant diseases using advanced AI. Get accurate diagnoses, symptoms, and treatment recommendations in seconds.
                </Subtitle>
                <PrimaryButton title="Get Started Free" onPress={() => navigation.navigate('Login')} />
              </View>

              {/* Feature cards (lightweight) */}
              <View style={{ height: spacing(2) }} />
              <Card>
                <Text style={styles.featureTitle}>Why Choose Leaflens?</Text>
                <View style={{ height: spacing(1) }} />
                <Text style={styles.featureText}>Advanced AI meets botanical expertise to keep your plants healthy.</Text>
                <View style={{ height: spacing(1.5) }} />
                <PrimaryButton title="Learn More" onPress={() => navigation.navigate('Login')} />
              </Card>

              <View style={{ height: spacing(2) }} />
              <Card>
                <Text style={styles.featureTitle}>Ready to Protect Your Plants?</Text>
                <View style={{ height: spacing(1) }} />
                <Text style={styles.featureText}>Join thousands of plant lovers using Leaflens to keep their gardens healthy.</Text>
                <View style={{ height: spacing(1.5) }} />
                <PrimaryButton title="Start Diagnosing Now" onPress={() => navigation.navigate('Login')} />
              </Card>
            </ScrollView>
          </Screen>
        );
      }

      const styles = StyleSheet.create({
  // No extra badge wrapper; LogoMark renders its own rounded tile
        brand: { color: colors.text, fontWeight: '800', fontSize: 22 },
        pill: { alignSelf: 'flex-start', backgroundColor: '#18473D', color: '#BFE8D7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontWeight: '700', fontSize: 12 },
        hero: { marginBottom: spacing(2) },
        h1: { color: colors.text, fontSize: 32, fontWeight: '900', lineHeight: 38 },
        featureTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
        featureText: { color: colors.textMuted, fontSize: 14 },
      });
