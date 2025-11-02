import * as FileSystem from 'expo-file-system/legacy';

// Configuration for model download and storage
export interface ModelConfig {
  fileName: string;
  url: string; // set the hosted model URL
  md5?: string; // optional checksum
  dir: string; // device directory
}

export const MODEL_CONFIG: ModelConfig = {
  fileName: 'banana.fp16.onnx',
  url: '',
  md5: undefined,
  dir: (FileSystem as any).documentDirectory
    ? ((FileSystem as any).documentDirectory as string) + 'models/banana/'
    : (((FileSystem as any).cacheDirectory as string) || '') + 'models/banana/',
};

export function getLocalModelUri() {
  return MODEL_CONFIG.dir + MODEL_CONFIG.fileName;
}
