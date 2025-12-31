# Model Downloader

This app does NOT bundle the large ONNX model to avoid Metro transform errors and reduce app size.

On first run, the app downloads a near-lossless FP16 ONNX model to device storage and loads it from the filesystem.

Configure the downloader in `src/config/modelConfig.ts`:
- MODEL_CONFIG.url: the HTTPS URL to the `banana.fp16.onnx` file
- MODEL_CONFIG.md5: optional MD5 checksum for integrity (hex lowercase)

Conversion helper to create FP16:
- `python convert/quantize_fp16.py --in build_export/banana.onnx --out build_export/banana.fp16.onnx`

Optional: also generate a dynamic-quantized variant for experiments:
- add `--also-dynamic` to create `banana.fp16.dyn.onnx`
