import argparse
import os
from pathlib import Path

# Lazy import to provide nicer error if tensorflow/tfjs missing

def main():
    parser = argparse.ArgumentParser(description="Convert Keras (.keras or SavedModel) to TensorFlow.js model")
    parser.add_argument("--input", required=True, help="Path to .keras file or SavedModel directory")
    parser.add_argument("--output-dir", required=True, help="Destination directory for TFJS model")
    parser.add_argument("--format", choices=["graph", "layers"], default="graph", help="TFJS output format")
    parser.add_argument("--quantize", choices=["none", "float16", "uint8"], default="none", help="Weight quantization")
    args = parser.parse_args()

    src = Path(args.input)
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        import tensorflow as tf
    except Exception as e:
        raise SystemExit("TensorFlow is required. Install with: pip install tensorflow") from e

    try:
        import tensorflowjs as tfjs  # noqa: F401
    except Exception as e:
        raise SystemExit("tensorflowjs is required. Install with: pip install tensorflowjs") from e

    # Load model
    if src.is_dir():
        # Treat as SavedModel
        print(f"[convert] Loading SavedModel from {src} ...")
        model = tf.saved_model.load(str(src))
        # For conversion, export a fresh SavedModel directory using Keras API if possible
        try:
            # If it's a functional model bound in keras API
            print("[convert] Attempting to re-save as Keras SavedModel via tf.keras.models.Model...")
            concrete = None
            try:
                # Try to get default serving signature
                concrete = model.signatures.get("serving_default")
            except Exception:
                pass
            export_dir = out_dir / "_tmp_saved_model"
            export_dir.mkdir(exist_ok=True)
            tf.saved_model.save(model, str(export_dir))
            saved_for_tfjs = export_dir
        except Exception:
            # Fallback to original SavedModel directory
            print("[convert] Using original SavedModel for tfjs converter")
            saved_for_tfjs = src
    else:
        # Load .keras
        print(f"[convert] Loading Keras model from {src} ...")
        model = tf.keras.models.load_model(str(src), compile=False)
        export_dir = out_dir / "_tmp_saved_model"
        print(f"[convert] Exporting to SavedModel at {export_dir} ...")
        tf.saved_model.save(model, str(export_dir))
        saved_for_tfjs = export_dir

    # Build tensorflowjs_converter args
    cmd = [
        "-m", "tensorflowjs_converter",
        "--input_format=tf_saved_model",
        "--signature_name=serving_default",
        "--saved_model_tags=serve",
    ]

    if args.format == "graph":
        cmd += ["--output_format=tfjs_graph_model"]
    else:
        cmd += ["--output_format=tfjs_layers_model"]

    if args.quantize == "float16":
        cmd += ["--quantize_float16"]
    elif args.quantize == "uint8":
        cmd += ["--quantize_uint8"]

    cmd += [str(saved_for_tfjs), str(out_dir)]

    # Run converter as a module (same Python)
    import runpy
    import sys

    print("[convert] Running tensorflowjs_converter with:")
    print("python", " ".join(cmd))
    # Temporarily adjust sys.argv for module call
    orig_argv = sys.argv[:]
    sys.argv = ["python"] + cmd
    try:
        runpy.run_module("tensorflowjs_converter", run_name="__main__")
    finally:
        sys.argv = orig_argv

    # Cleanup temp SavedModel if created inside output dir
    tmp_dir = out_dir / "_tmp_saved_model"
    if tmp_dir.exists():
        import shutil
        shutil.rmtree(tmp_dir)

    print(f"[convert] Done. Outputs at: {out_dir}")


if __name__ == "__main__":
    main()
