import os
import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType
from onnxmltools.utils.float16_converter import convert_float_to_float16

"""
Usage:
  python -m venv .venv-py310-convert
  # activate venv, install requirements-py310.txt
  python convert/quantize_fp16.py --in build_export/banana.onnx --out build_export/banana.fp16.onnx --also-dynamic

This script converts FP32 ONNX to FP16 and optionally applies dynamic quant to linear ops.
"""

import argparse

def main():
  p = argparse.ArgumentParser()
  p.add_argument('--in', dest='inp', required=True)
  p.add_argument('--out', dest='out', required=True)
  p.add_argument('--also-dynamic', action='store_true')
  args = p.parse_args()

  os.makedirs(os.path.dirname(args.out), exist_ok=True)
  print('Loading ONNX:', args.inp)
  model = onnx.load(args.inp)
  onnx.checker.check_model(model)

  print('Converting to FP16...')
  fp16_model = convert_float_to_float16(model)
  onnx.save(fp16_model, args.out)
  print('Saved FP16 to', args.out)

  if args.also_dynamic:
    dq_out = args.out.replace('.onnx', '.dyn.onnx')
    print('Applying dynamic quant to linear ops ->', dq_out)
    quantize_dynamic(model_input=args.out, model_output=dq_out, weight_type=QuantType.QUInt8, optimize_model=True)
    print('Saved dynamic-quantized model to', dq_out)

if __name__ == '__main__':
  main()
