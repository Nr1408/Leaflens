import { resolveBaseUrl, resolveModelQuery } from '../config/api';

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
