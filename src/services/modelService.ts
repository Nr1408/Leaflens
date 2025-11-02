import * as FileSystem from 'expo-file-system/legacy';
// Swapping to ONNX Runtime for inference
// Dynamically import onnxruntime-react-native only when available (requires dev build)
import * as ImageManipulator from 'expo-image-manipulator';
import Constants from 'expo-constants';
import * as JPEG from 'jpeg-js';
import { toByteArray as base64ToBytes } from 'base64-js';
import { ensureModelDownloaded } from './modelDownloader';
import { getLocalModelUri } from '../config/modelConfig';

let initialized = false;
const DEBUG_STRICT = false; // set true to surface all model errors

// ===== Model configuration (adjust to your model) =====
// Resize target (square). Change if your model expects a different size.
const INPUT_SIZE = 224;
// Minimal stub: provides a predictable result without any model.
let LABELS: string[];
try {
  LABELS = require('../../assets/models/banana/labels.json');
} catch {
  LABELS = ['Healthy', 'Disease A', 'Disease B'];
}

export async function ensureModelReady() {
  return true;
}

export type InferenceResult = { label: string; probability: number };
export type InferenceBundle = { top1: InferenceResult; topK: InferenceResult[] };

export async function runInference(_imageUri: string): Promise<InferenceBundle> {
  const top1 = { label: LABELS[0] || 'Healthy', probability: 0.5 };
  return { top1, topK: [top1] };
}

export async function runInferenceFromBase64(_base64: string): Promise<InferenceBundle> {
  return runInference('');
}

export const classLabels = LABELS;
/**
