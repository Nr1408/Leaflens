import os, json, shutil, subprocess
import torch, torch.nn as nn
import timm

CKPT_PATH = os.path.join('checkpoints','best_model.pth')
IMG_SIZE = 224
NUM_CLASSES = 9
WORK_DIR = 'build_export'
ONNX_PATH = os.path.join(WORK_DIR,'banana.onnx')
RAW_SM = os.path.join(WORK_DIR,'raw_savedmodel')
CLEAN_SM = os.path.join(WORK_DIR,'clean_savedmodel')
TFJS_OUT = os.path.join('assets','models','banana')  # final destination
INPUT_NAME = 'input'
OUTPUT_NAME = 'logits'
OPSET = 17  # Need >=14 for scaled_dot_product_attention used inside ViT

os.makedirs(WORK_DIR, exist_ok=True)
os.makedirs(TFJS_OUT, exist_ok=True)

class HybridCNNViT(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.vit = timm.create_model('vit_large_patch16_224', pretrained=False)
        self.vit.head = nn.Identity()
        self.cnn = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(),
            nn.AdaptiveAvgPool2d((7,7)), nn.Flatten()
        )
        vit_out = 1024
        cnn_out = 64*7*7
        self.fc = nn.Linear(vit_out + cnn_out, num_classes)
    def forward(self, x):
        vit_feat = self.vit(x)
        cnn_feat = self.cnn(x)
        return self.fc(torch.cat((vit_feat, cnn_feat), dim=1))

print('Loading checkpoint:', CKPT_PATH)
ckpt = torch.load(CKPT_PATH, map_location='cpu')
model = HybridCNNViT(NUM_CLASSES)
state = ckpt.get('model_state_dict', ckpt)
missing, unexpected = model.load_state_dict(state, strict=False)
print('Missing keys:', missing, 'Unexpected:', unexpected)
model.eval()

print('Exporting ONNX ->', ONNX_PATH)
dummy = torch.randn(1,3,IMG_SIZE,IMG_SIZE)
torch.onnx.export(
    model,
    dummy,
    ONNX_PATH,
    input_names=[INPUT_NAME],
    output_names=[OUTPUT_NAME],
    opset_version=OPSET,
    dynamic_axes={INPUT_NAME: {0: 'batch'}, OUTPUT_NAME: {0: 'batch'}},
)
print('ONNX export done.')

import onnx
from onnx_tf.backend import prepare
onnx_model = onnx.load(ONNX_PATH)
onnx.checker.check_model(onnx_model)
print('ONNX check passed.')
print('Converting ONNX -> TensorFlow SavedModel (raw)')
rep = prepare(onnx_model)
rep.export_graph(RAW_SM)
print('Raw SavedModel at', RAW_SM)

import tensorflow as tf
loaded = tf.saved_model.load(RAW_SM)
run_fn = getattr(loaded, 'run', None)
if run_fn is None:
    for name in dir(loaded):
        if not name.startswith('_'):
            cand = getattr(loaded, name)
            if callable(cand):
                run_fn = cand
                break
if run_fn is None:
    raise RuntimeError('Could not locate callable in SavedModel')

@tf.function(input_signature=[tf.TensorSpec([None, IMG_SIZE, IMG_SIZE, 3], tf.float32, name=INPUT_NAME)])
def serving_default(x_nhwc):
    x_nchw = tf.transpose(x_nhwc, [0,3,1,2])
    out = run_fn(x_nchw)
    if isinstance(out, dict):
        tensor = list(out.values())[0]
    else:
        tensor = out
    return {OUTPUT_NAME: tensor}

if os.path.exists(CLEAN_SM):
    shutil.rmtree(CLEAN_SM)
print('Writing clean SavedModel with NHWC signature ->', CLEAN_SM)
tf.saved_model.save(serving_default, CLEAN_SM, signatures={'serving_default': serving_default})

print('Converting to TFJS graph model ...')
cmd = [
    'tensorflowjs_converter',
    '--input_format=tf_saved_model',
    '--output_format=tfjs_graph_model',
    '--signature_name=serving_default',
    '--saved_model_tags=serve',
    CLEAN_SM,
    TFJS_OUT
]
print('Running:', ' '.join(cmd))
subprocess.run(cmd, check=True)
print('TFJS export complete. Files in', TFJS_OUT)

meta = {
  'img_size': IMG_SIZE,
  'num_classes': NUM_CLASSES,
  'mean': [0.5,0.5,0.5],
  'std': [0.5,0.5,0.5],
  'input_layout': 'NHWC',
  'internal_layout': 'NCHW',
  'output': OUTPUT_NAME
}
with open(os.path.join(TFJS_OUT,'export_meta.json'),'w') as f:
    json.dump(meta,f,indent=2)
print('Done.')
