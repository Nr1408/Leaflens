/*
  Native On-Device Inference bridge
  - Thin wrapper over the Android native module that loads a model and
    runs inference on an image URI, returning class probabilities.
*/
import { NativeModules, Platform } from 'react-native';

type InferenceResult = {
  probabilities: number[];
};

const Native = NativeModules?.OnDeviceInference as
  | { loadModel(path: string): Promise<boolean>; diagnoseImage(uri: string): Promise<InferenceResult> }
  | undefined;

export async function loadModel(path: string): Promise<boolean> {
  if (Platform.OS !== 'android') throw new Error('OnDeviceInference is Android-only for now');
  if (!Native) throw new Error('OnDeviceInference native module not available');
  return Native.loadModel(path);
}

export async function diagnoseImage(uri: string): Promise<InferenceResult> {
  if (Platform.OS !== 'android') throw new Error('OnDeviceInference is Android-only for now');
  if (!Native) throw new Error('OnDeviceInference native module not available');
  return Native.diagnoseImage(uri);
}
