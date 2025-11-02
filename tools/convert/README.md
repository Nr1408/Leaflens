# LeafLens model conversion toolkit

Convert a Keras `.keras` file or a TensorFlow SavedModel to a TensorFlow.js model usable in the Expo app (`model.json` + `.bin` shards).

You have three reliable paths. Pick one:

## 1) Google Colab (zero local setup)

Use this when local TensorFlow installs are troublesome.

1. Upload your `model.keras` (or `.zip` SavedModel) to Colab Files or Drive.
2. Run the following in a Colab notebook cell:

```python
!pip -q install --upgrade tensorflow tensorflowjs

import tensorflow as tf, os, shutil
from pathlib import Path

src = '/content/model.keras'  # change if needed
out_dir = Path('/content/tfjs_model')
out_dir.mkdir(parents=True, exist_ok=True)

model = tf.keras.models.load_model(src, compile=False)
export_dir = '/content/saved_model'
tf.saved_model.save(model, export_dir)

!python -m tensorflowjs_converter \
  --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  --signature_name=serving_default \
  --saved_model_tags=serve \
  --quantize_float16 \
  /content/saved_model /content/tfjs_model

print('Done ->', os.listdir(out_dir))
```

3. Download the folder `/content/tfjs_model` and place it at `assets/models/banana/` in this repo.

## 2) Docker (no local Python/TF needed)

Prereq: Docker Desktop installed.

Build the converter image once:

```powershell
docker build -t keras2tfjs tools/convert
```

Run conversion (mounts your project to `/work` inside container):

```powershell
# Example with input at C:\LeafLens\models\model.keras
docker run --rm -v ${PWD}:/work keras2tfjs \
  python tools/convert/convert_keras_to_tfjs.py \
  --input models/model.keras \
  --output-dir assets/models/banana \
  --format graph \
  --quantize float16
```

Outputs: `assets/models/banana/model.json` + `.bin` shards.

## 3) Local Python virtualenv (Windows PowerShell)

Use this if you prefer local tools. GPU is not required.

```powershell
python -m venv .venv; . .venv/Scripts/Activate.ps1
pip install --upgrade pip
pip install "tensorflow>=2.12,<2.17" tensorflowjs==4.*
python tools/convert/convert_keras_to_tfjs.py \
  --input models/model.keras \
  --output-dir assets/models/banana \
  --format graph \
  --quantize float16
```

Notes
- If `pip install tensorflow` fails on Windows, prefer Docker (above) or Colab.
- `--format graph` is recommended for performance. `--format layers` also works if you prefer `tf.loadLayersModel`.
- `--quantize float16` reduces size with minimal accuracy loss. Omit or set `--quantize none` if you want full precision.

## App integration recap

1) Place the converted files here:
- `assets/models/banana/model.json`
- `assets/models/banana/group1-shard1ofN.bin` (one or more shards)

2) In `src/services/modelService.ts`, replace the heuristic with real inference using `tf.loadGraphModel` and `bundleResourceIO` (already scaffolded in comments). Make sure `INPUT_SIZE`, normalization, and label order match your training.

Troubleshooting
- If conversion complains about missing ops, share the error text. We may need to export to ONNX first or tweak the graph.
- For Keras 3, always load with `compile=False` for portability.
