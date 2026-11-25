"""Build the smaller-window SCNet export from the pinned audiojs checkpoint."""

from pathlib import Path
import hashlib

import numpy as np
import onnx
from onnx import numpy_helper

MODEL_DIR = Path(__file__).resolve().parents[1] / "assets" / "stem-models" / "scnet"
SOURCE = MODEL_DIR / "scnet.int8.onnx"
SOURCE_SHA256 = "98228931494151762a1c4ab1ec7899a894b1f81fd4a509921a9d2f9bacc50845"
SOURCE_FRAMES = 476
MOBILE_FRAMES = 96


def transforms(frames):
    time = np.arange(frames, dtype=np.float64)
    frequency = np.arange(frames // 2 + 1, dtype=np.float64)
    angle = 2 * np.pi * frequency[:, None] * time[None, :] / frames
    cosine = np.cos(angle) / np.sqrt(frames)
    sine = -np.sin(angle) / np.sqrt(frames)
    weights = np.full((len(frequency), 1), 2.0)
    weights[[0, -1], :] = 1
    return {"_71": sine * weights, "_73": cosine * weights, "_7d": sine.T, "_7e": cosine.T}


assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA256
model = onnx.load(SOURCE)
original = transforms(SOURCE_FRAMES)
mobile = transforms(MOBILE_FRAMES)
for tensor in model.graph.initializer:
    values = numpy_helper.to_array(tensor)
    if tensor.name in mobile:
        np.testing.assert_allclose(values, original[tensor.name], atol=1e-7)
        tensor.CopyFrom(numpy_helper.from_array(mobile[tensor.name].astype(np.float32), tensor.name))
    elif np.issubdtype(values.dtype, np.integer) and (
        (values == SOURCE_FRAMES).any() or (values == SOURCE_FRAMES // 2 + 1).any()
    ):
        resized = values.copy()
        resized[values == SOURCE_FRAMES] = MOBILE_FRAMES
        resized[values == SOURCE_FRAMES // 2 + 1] = MOBILE_FRAMES // 2 + 1
        tensor.CopyFrom(numpy_helper.from_array(resized, tensor.name))
model.graph.input[0].type.tensor_type.shape.dim[3].dim_value = MOBILE_FRAMES
onnx.checker.check_model(model, full_check=True)
onnx.save(model, MODEL_DIR / "scnet-mobile.int8.onnx")
