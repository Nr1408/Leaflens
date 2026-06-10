import { resolveBaseUrl, resolveModelQuery } from '../config/api';
import * as FileSystem from 'expo-file-system/legacy';

export type DiagnoseOptions = {
  baseUrl?: string;
  endpointPath?: string; // default '/predict/'
  fileFieldName?: string; // default 'file'
  filename?: string; // default 'leaf.jpg'
  mimeType?: string; // default 'image/jpeg'
  timeoutMs?: number; // default 120000
};

export async function diagnoseImage(imageUri: string, opts: DiagnoseOptions = {}) {
  const {
    baseUrl = resolveBaseUrl(),
    endpointPath = '/predict/',
    fileFieldName = 'file',
    filename = 'leaf.jpg',
    mimeType = 'image/jpeg',
    timeoutMs = 120_000,
  } = opts;

  // Detect if the endpoint is a Hugging Face Gradio Space
  const isGradio = baseUrl.includes('.hf.space') || baseUrl.includes('gradio');

  if (isGradio) {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' as any });
      const dataUri = `data:${mimeType};base64,${base64}`;
      const sessionHash = Math.random().toString(36).substring(2);

      // 1. Join the Gradio queue
      // Gradio v4 expects an ImageData dict for images, not just a raw string
      const joinRes = await fetch(`${baseUrl}/gradio_api/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [{ url: dataUri }], fn_index: 0, session_hash: sessionHash })
      });
      if (!joinRes.ok) throw new Error(`Queue Join Failed: ${joinRes.status}`);

      // 2. Listen to the Server-Sent Events stream using XMLHttpRequest (RN compatible)
      const outputData = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${baseUrl}/gradio_api/queue/data?session_hash=${sessionHash}`, true);
        xhr.setRequestHeader('Accept', 'text/event-stream');

        // Failsafe timeout
        const timeoutId = setTimeout(() => { xhr.abort(); reject(new Error('Queue timeout')); }, timeoutMs);

        xhr.onprogress = () => {
          const text = xhr.responseText;
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              try {
                const json = JSON.parse(line.substring(6));
                if (json.msg === 'process_completed') {
                  clearTimeout(timeoutId);
                  xhr.abort();
                  if (!json.success) {
                    reject(new Error(json.output?.error || 'Gradio inference failed'));
                    return;
                  }
                  resolve(json.output.data[0]);
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        };

        xhr.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('XHR stream error'));
        };
        xhr.send();
      });

      // Helper to shorten long labels from the model
      const formatLabel = (label: string) => {
        if (label.includes('Not a banana plant image')) {
          return 'Not a Banana Plant';
        }
        return label;
      };

      // Parse Gradio gr.Label() output format
      if (outputData && typeof outputData === 'object' && Array.isArray(outputData.confidences)) {
        const topK = outputData.confidences.map((c: any) => ({
          label: formatLabel(String(c.label)),
          probability: Number(c.confidence || 0)
        }));
        return {
          top1: topK[0] || { label: formatLabel(outputData.label || 'Unknown'), probability: 1.0 },
          topK,
          predictions: topK
        };
      } else if (outputData && typeof outputData === 'object') {
        const entries = Object.entries(outputData).map(([k, v]) => ({ label: formatLabel(k), probability: Number(v) }));
        entries.sort((a, b) => b.probability - a.probability);
        return {
          top1: entries[0] || { label: 'Unknown', probability: 0 },
          topK: entries,
          predictions: entries
        };
      }
      
      throw new Error('Unexpected Gradio response format');
    } catch (e: any) {
      throw e;
    }
  }

  // Build a fresh FormData per attempt because RN may consume streams
  const buildForm = () => {
    const f = new FormData();
    f.append(fileFieldName, { uri: imageUri, name: filename, type: mimeType } as any);
    return f;
  };
  try {
    // Build a list of base URLs to try (port fallback between 8080 and 8000)
    const tryUrls = (() => {
      try {
        const u = new URL(baseUrl);
        const candidates = new Set<string>();
        if (u.port) {
          candidates.add(`${u.protocol}//${u.hostname}:${u.port}`);
          if (u.port === '8080') candidates.add(`${u.protocol}//${u.hostname}:8000`);
          if (u.port === '8000') candidates.add(`${u.protocol}//${u.hostname}:8080`);
        } else {
          candidates.add(baseUrl);
          candidates.add(`${u.protocol}//${u.hostname}:8080`);
          candidates.add(`${u.protocol}//${u.hostname}:8000`);
        }
        return Array.from(candidates);
      } catch {
        return [baseUrl];
      }
    })();

    // Helpful debug log in development
    // eslint-disable-next-line no-console
    console.log('[LeafLens] diagnoseImage ->', { baseUrl, endpointPath, tryUrls });

    let lastErrorText = '';
    // Try both with and without trailing slash to avoid redirect issues on mobile POSTs
    const modelSuffix = resolveModelQuery();
    const endpointVariants = Array.from(new Set([
      `${endpointPath}${modelSuffix}`,
      `${endpointPath.replace(/\/$/, '')}${modelSuffix}`,
      endpointPath,
      endpointPath.replace(/\/$/, ''),
    ]));
    // Try twice with fresh AbortController and FormData each time
    const attempts = 2;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      for (const b of tryUrls) {
        for (const ep of endpointVariants) {
          // Setup per-request timeout controller
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeoutMs);
          try {
            const res = await fetch(`${b}${ep}`, {
              method: 'POST',
              headers: { Accept: 'application/json' },
              body: buildForm(),
              signal: controller.signal,
            });
            if (!res.ok) {
              const text = await res.text().catch(() => '');
              lastErrorText = `Server ${res.status}: ${text || res.statusText}`;
              continue;
            }
            return await res.json();
          } catch (inner: any) {
            lastErrorText = String(inner?.message || inner);
            continue;
          } finally {
            clearTimeout(id);
          }
        }
      }
    }
    throw new Error(lastErrorText || 'All endpoints failed');
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Request timed out');
    if (/Network request failed/i.test(String(e))) {
      const url = `${baseUrl}${endpointPath}`;
      throw new Error(
        `Network request failed to ${url}. Check Wi‑Fi (same LAN), server is reachable, Docker port mapping, and Windows firewall for port ${new URL(url).port || '80'}.`
      );
    }
    throw e;
  }
}
