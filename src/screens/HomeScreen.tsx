import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../state/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Screen, Title, Subtitle, Card, PrimaryButton, HeaderBar, SectionCard, AnimatedActionTile, SeverityTag } from '../ui/components';
import LogoMark from '../ui/LogoMark';
import { colors, spacing, shadow } from '../ui/theme';
import AppHeader from '../ui/AppHeader';
import { getHistory, DiagnosisItem, clearHistory } from '../services/history';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// Use local on-device inference (stubbed until native/TFJS wiring complete)
import { diagnoseImage } from '../services';
import { addDiagnosis } from '../services/history';
import { getDiseaseInfo } from '../data/bananaInfo';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [history, setHistory] = React.useState<DiagnosisItem[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  React.useEffect(() => {
    const unsub = navigation.addListener('focus', async () => {
      setHistory(await getHistory());
    });
    return unsub;
  }, [navigation]);

  const handleResultNavigate = async (imageUri: string, json: any) => {
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
    if (!topK.length) topK = [{ label: 'Unknown', probability: 0 }];
    const top1 = json?.top1
      ? { label: String(json.top1.label ?? json.top1.class ?? json.top1.name ?? 'Unknown'), probability: Number(json.top1.probability ?? json.top1.score ?? json.top1.confidence ?? 0) }
      : topK[0];
    navigation.navigate('Result', { label: top1.label, probability: top1.probability, topK, imageUri });
    addDiagnosis({ label: top1.label, probability: top1.probability, imageUri }).catch(() => {});
    setHistory(await getHistory());
  };

  const takePhoto = async () => {
    try {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return Alert.alert(t('permissionRequired'), t('allowCameraAccess'));
      const res = await ImagePicker.launchCameraAsync({ quality: 1 });
      if (!res.canceled) {
        const uri = res.assets[0].uri;
        setBusy(true);
        const json = await diagnoseImage(uri, {});
        await handleResultNavigate(uri, json);
      }
    } catch (e: any) {
      Alert.alert(t('captureFailed'), e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const pickImage = async () => {
    try {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return Alert.alert(t('permissionRequired'), t('allowPhotoAccess'));
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
      if (!res.canceled) {
        const uri = res.assets[0].uri;
        setBusy(true);
        const json = await diagnoseImage(uri, {});
        await handleResultNavigate(uri, json);
      }
    } catch (e: any) {
      Alert.alert(t('selectionFailed'), e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <AppHeader
        onHome={() => navigation.navigate('Home')}
        onCommunity={() => navigation.navigate('Community')}
        onHistory={() => navigation.navigate('History')}
        onProfile={() => navigation.navigate('Profile')}
      />

      {/* Section label */}
      

      <ScrollView contentContainerStyle={{ paddingBottom: spacing(8) }} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={[base.heroBox, { backgroundColor: colors.bgAlt, borderColor: colors.divider }] }>
          <Text style={[base.pill, { backgroundColor: '#DCF5E9', color: '#166534' }]}>{t('homeHeroPill')}</Text>
          <View style={{ height: spacing(1.5) }} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', lineHeight: 34 }}>{t('homeH1Line1')}{"\n"}{t('homeH1Line2')}</Text>
          <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '900', lineHeight: 34 }}>{t('inSeconds')}</Text>
          <View style={{ height: spacing(1) }} />
          <Text style={{ color: colors.textMuted }}>{t('homeHeroDesc')}</Text>
        </View>

        {/* Scan card */}
        <Card>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>{t('scanYourPlant')}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, textAlign: 'center' }}>{t('uploadPrompt')}</Text>
          <View style={{ height: spacing(2) }} />
          <PrimaryButton
            title={busy ? t('analyzing') : t('takePhoto')}
            onPress={takePhoto}
            icon={<Ionicons name="camera-outline" size={18} color="#fff" />}
          />
          <View style={{ height: spacing(1) }} />
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={pickImage}
            style={[base.secondaryButton, { borderColor: colors.divider, backgroundColor: colors.bgAlt }]}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t('uploadImage')}</Text>
          </TouchableOpacity>
          {busy && <ActivityIndicator style={{ marginTop: 8 }} />}
        </Card>
        <View style={{ height: spacing(1.5) }} />
        {history.length > 0 ? (
          <SectionCard
            title={t('recentDiagnoses')}
            footer={
              <TouchableOpacity
                onPress={async () => { await clearHistory(); setHistory([]); }}
                activeOpacity={0.9}
                style={{ alignSelf: 'flex-start', backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
              >
                <Text style={{ color: 'white', fontWeight: '800' }}>{t('clearAll')}</Text>
              </TouchableOpacity>
            }
          >
            {history.map((h) => {
              const info = getDiseaseInfo(h.label);
              const isSelected = selectedId === h.id;
              const isExpanded = expandedId === h.id;
              const severity: 'low' | 'medium' | 'high' = h.probability >= 0.8 ? 'low' : h.probability >= 0.5 ? 'medium' : 'high';
              const ago = timeAgo(h.at);
              return (
                <View key={h.id} style={{ paddingVertical: 8 }}>
                  {/* Row clickable to reveal expand action */}
                  <TouchableOpacity onPress={() => { setSelectedId(h.id); if (expandedId && expandedId !== h.id) setExpandedId(null); }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: colors.text, fontWeight: '700' }}>{info?.name ?? h.label}</Text>
                      <Text style={{ color: colors.textMuted }}>{(h.probability * 100).toFixed(1)}%</Text>
                    </View>
                  </TouchableOpacity>
                          {isSelected && !isExpanded && (
                            <View style={{ marginTop: 8 }}>
                              <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => setExpandedId(h.id)}
                                style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.bgAlt, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}
                              >
                        <Text style={{ color: colors.text, fontWeight: '700' }}>{t('expandDiagnosis')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {isExpanded && (
                    <Card style={{ marginTop: spacing(1) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', flex: 1, paddingRight: 8 }}>
                          {info?.name ?? h.label}
                        </Text>
                        <View style={{ alignSelf: 'flex-start', marginLeft: 'auto' }}>
                          <SeverityTag level={severity} label={severity} />
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                        <Text style={{ color: colors.textMuted }}>{t('detected')} {ago}</Text>
                        <Text style={{ color: colors.textMuted }}>•</Text>
                        <Text style={{ color: colors.textMuted }}>{(h.probability * 100).toFixed(0)}% {t('confidence')}</Text>
                      </View>
                      {/* Symptoms */}
                      <Text style={{ color: colors.text, fontWeight: '800', marginTop: spacing(2) }}>{t('symptoms')}</Text>
                      {(info?.symptoms || ['No data']).map((s, i) => (
                        <View key={`sym-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 8 }} />
                          <Text style={{ color: colors.textMuted, flex: 1 }}>{s}</Text>
                        </View>
                      ))}
                      {/* Treatments */}
                      <Text style={{ color: colors.text, fontWeight: '800', marginTop: spacing(2) }}>{t('treatments')}</Text>
                      {(info?.treatment || ['No data']).map((t, i) => (
                        <View key={`treat-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 }}>
                          <Ionicons name="checkmark" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                          <Text style={{ color: colors.textMuted, flex: 1 }}>{t}</Text>
                        </View>
                      ))}
                      <View style={{ marginTop: spacing(2), flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={() => setExpandedId(null)} activeOpacity={0.9} style={{ flex: 1, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.bgAlt, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
                          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('collapse')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Result', { label: info?.name ?? h.label, probability: h.probability, imageUri: h.imageUri })} activeOpacity={0.9} style={{ flex: 1, backgroundColor: '#146E43', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
                          <Text style={{ color: 'white', fontWeight: '800' }}>{t('openFullView')}</Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  )}
                </View>
              );
            })}
          </SectionCard>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: spacing(3) }}>
            <Ionicons name="leaf-outline" size={56} color={colors.textMuted} />
            <View style={{ height: spacing(1) }} />
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{t('noDiagnosesYet')}</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const base = StyleSheet.create({
  heroBox: { borderRadius: 18, padding: spacing(2), marginBottom: spacing(2), borderWidth: 1 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontWeight: '700', fontSize: 12 },
  secondaryButton: { borderWidth: 1, paddingVertical: spacing(1.75), borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
});

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 45) return t('justNow');
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}${t('minuteShort')} ${t('ago')}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${t('hourShort')} ${t('ago')}`;
  const d = Math.floor(h / 24);
  return `${d}${t('dayShort')} ${t('ago')}`;
}
