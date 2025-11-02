import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Note: This screen is deprecated (diagnosis is inline on Home). Keep lightweight typing to avoid TS errors.
import { diagnoseImage } from '../services/cloudInference';
import { Screen, PrimaryButton, HeaderBar, SectionCard, AnimatedActionTile } from '../ui/components';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../ui/theme';
import { addDiagnosis } from '../services/history';

type Props = { navigation: any };

export default function DiagnoseScreen({ navigation }: Props) {
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [imageB64, setImageB64] = useState<string | undefined>();
  const [crop, setCrop] = useState('Banana');
  const [risk, setRisk] = useState<'high' | 'none'>('none');

  useEffect(() => {
    // No-op on mount for cloud inference path
  }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission required', 'Please allow photo library access.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, base64: true });
    if (!res.canceled) {
      const asset = res.assets[0];
      setImageUri(asset.uri);
      setImageB64(asset.base64 ?? undefined);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission required', 'Please allow camera access.');
    const res = await ImagePicker.launchCameraAsync({ quality: 1, base64: true });
    if (!res.canceled) {
      const asset = res.assets[0];
      setImageUri(asset.uri);
      setImageB64(asset.base64 ?? undefined);
    }
  };

  const diagnose = async () => {
    if (!imageUri) return;
    setBusy(true);
    try {
      const json: any = await diagnoseImage(imageUri, {});

      let topK: { label: string; probability: number }[] = [];
      if (Array.isArray(json?.topK)) {
        topK = json.topK.map((p: any) => ({ label: String(p.label ?? p.class ?? p.name ?? 'Unknown'), probability: Number(p.probability ?? p.score ?? p.confidence ?? 0) }));
      } else if (Array.isArray(json?.predictions)) {
        topK = json.predictions.map((p: any) => ({ label: String(p.label ?? p.class ?? p.name ?? 'Unknown'), probability: Number(p.probability ?? p.score ?? p.confidence ?? 0) }));
      } else if (json?.predictions && typeof json.predictions === 'object') {
        topK = Object.entries(json.predictions)
          .map(([label, prob]) => ({ label: String(label), probability: Number(prob) }))
          .sort((a, b) => b.probability - a.probability);
      }
      if (!topK.length && json?.label) {
        topK = [{ label: String(json.label), probability: Number(json.probability ?? json.score ?? json.confidence ?? 0) }];
      }
      if (!topK.length) {
        topK = [{ label: 'Unknown', probability: 0 }];
      }
      const top1 = json?.top1
        ? { label: String(json.top1.label ?? json.top1.class ?? json.top1.name ?? 'Unknown'), probability: Number(json.top1.probability ?? json.top1.score ?? json.top1.confidence ?? 0) }
        : topK[0];

      navigation.navigate('Result', { label: top1.label, probability: top1.probability, topK, imageUri });
      addDiagnosis({ label: top1.label, probability: top1.probability, imageUri }).catch(() => {});
      if (top1.probability > 0.7 && top1.label !== 'Healthy Banana' && top1.label !== 'Healthy Banana  leaf') {
        setRisk('high');
      } else {
        setRisk('none');
      }
    } catch (e: any) {
      Alert.alert('Inference failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <HeaderBar title="Diagnose Your Plant" />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', marginBottom: spacing(2) }}>
          <AnimatedActionTile label="Scan Leaf" onPress={takePhoto} icon={<Feather name="camera" size={34} color={colors.text} />} />
          <AnimatedActionTile label="Upload" onPress={pickImage} icon={<Feather name="upload" size={34} color={colors.text} />} />
        </View>
        <SectionCard title="Crop">
          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>Currently only Banana supported</Text>
          <View style={styles.cropPill}><Text style={styles.cropPillText}>{crop}</Text></View>
        </SectionCard>
        <View style={{ height: spacing(2) }} />
        <SectionCard title="Leaf Image">
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={[styles.preview, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: colors.textMuted }}>No image selected</Text>
            </View>
          )}
          <View style={{ height: spacing(1.5) }} />
          <PrimaryButton title={busy ? 'Analyzing...' : 'Run Diagnosis'} onPress={diagnose} disabled={!imageUri || busy} />
          {!imageUri && <Text style={{ color: colors.textMuted, marginTop: 8 }}>Tip: pick or scan a leaf image first.</Text>}
          {busy && <ActivityIndicator style={{ marginTop: 12 }} />}
        </SectionCard>
        <View style={{ height: spacing(2) }} />
        <SectionCard title="Tips for best results">
          <Text style={{ color: colors.textMuted }}>
            • Good lighting and focus improve accuracy. {'\n'}• Fill most of the frame with the leaf area. {'\n'}• Avoid heavily compressed screenshots.
          </Text>
        </SectionCard>
        {risk === 'high' && (
          <View style={styles.riskCard}>
            <Text style={styles.riskTitle}>High risk of disease detected</Text>
            <Text style={styles.riskBody}>Review the diagnosis details for symptoms & treatment recommendations.</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  preview: { width: '100%', height: 230, borderRadius: 18, backgroundColor: '#EEF7F2' },
  cropPill: { backgroundColor: colors.surface, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  cropPillText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  riskCard: { marginTop: spacing(2), backgroundColor: colors.bgAlt, borderRadius: 20, padding: spacing(2), borderWidth: 1, borderColor: colors.danger + '55' },
  riskTitle: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  riskBody: { color: colors.textMuted, lineHeight: 18, marginTop: 4 },
});
