// OfflinePredict screen (currently routed to server inference)
// Explanation: This UI is meant for on-device inference, but at the moment
// it calls the cloud FastAPI endpoint to return top-1 results. The layout
// and flow stay the same if we later swap in the native on-device path.
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image as RNImage, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { diagnoseImage as diagnoseCloud } from '../services/cloudInference';

// Class labels (order must match training)
const CLASS_NAMES = [
  'Anthracnose', 'Banana Fruit-Scarring Beetle', 'Banana Skipper Damage', 'Banana Split Peel',
  'Black and Yellow Sigatoka', 'Chewing insect damage on banana leaf', 'Healthy Banana',
  'Healthy Banana leaf', 'Panama Wilt Disease'
];

// This screen reuses the shared TorchScript inference service.

export default function OfflinePredictScreen() {
  const [predicting, setPredicting] = React.useState(false);
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ label: string; probability: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function pickAndPredict() {
    setError(null);
    setResult(null);
    setPredicting(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Gallery permission denied');

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (picked.canceled || !picked.assets?.length) {
        setPredicting(false);
        return;
      }
      const asset = picked.assets[0];
      setImageUri(asset.uri);

      const out = await diagnoseCloud(asset.uri);
      setResult(out.top1);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setPredicting(false);
    }
  }

  // Placeholder UI only (since gallery decode needs native bridge). Shows guidance.
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Offline Banana Disease Inference</Text>
  <Text style={styles.subtitle}>Using server inference via FastAPI.</Text>
  {/* diagnoseOffline handles lazy model load itself; no explicit model state here */}
      {imageUri && <RNImage source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />}
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>{result.label}</Text>
          <Text style={styles.resultProb}>{(result.probability * 100).toFixed(1)}%</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
  <Pressable style={styles.button} onPress={pickAndPredict} disabled={predicting}>
        <Text style={styles.buttonText}>{predicting ? 'Predicting…' : 'Pick Image & Predict'}</Text>
      </Pressable>
      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>Note</Text>
        <Text style={styles.hintText}>
          This screen uses the same server inference path as Home. Pick an image to send to the FastAPI backend and see the top-1 result.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'stretch' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 12 },
  success: { color: 'green', marginBottom: 12 },
  button: { backgroundColor: '#2D6A4F', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 12 },
  buttonText: { color: 'white', fontWeight: '600' },
  preview: { width: '100%', height: 240, backgroundColor: '#111', borderRadius: 12, marginVertical: 12 },
  resultBox: { padding: 16, backgroundColor: '#FFF3', borderRadius: 12, marginVertical: 12 },
  resultLabel: { fontSize: 18, fontWeight: '600' },
  resultProb: { fontSize: 14, opacity: 0.8 },
  error: { color: 'crimson', marginTop: 8 },
  hintBox: { backgroundColor: '#f0f4f8', padding: 12, borderRadius: 10, marginTop: 24 },
  hintTitle: { fontWeight: '600', marginBottom: 4 },
  hintText: { fontSize: 12, lineHeight: 16, color: '#333' },
});
