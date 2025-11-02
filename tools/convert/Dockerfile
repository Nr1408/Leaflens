# Simple conversion container for Keras/SavedModel -> TFJS
# Using Python base; CPU TF is fine for conversion
FROM python:3.11-slim

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir "tensorflow>=2.12,<2.17" tensorflowjs==4.*

WORKDIR /work

CMD ["python", "tools/convert/convert_keras_to_tfjs.py", "--help"]
