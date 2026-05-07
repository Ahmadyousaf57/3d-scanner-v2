"""
Local TripoSR inference — 100% free, runs on your machine.
Preprocessing pipeline matches the official TripoSR run.py exactly.
"""
import sys
import tempfile
import threading
from pathlib import Path

import numpy as np
import rembg
from PIL import Image

# Add TripoSR repo to path
TSR_PATH = Path(__file__).parent / "TripoSR"
if str(TSR_PATH) not in sys.path:
    sys.path.insert(0, str(TSR_PATH))

_model = None
_model_lock = threading.Lock()
_rembg_session = None


def _get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        print("[TripoSR] Loading rembg background removal model...")
        _rembg_session = rembg.new_session()
        print("[TripoSR] rembg ready.")
    return _rembg_session


def _load_model():
    global _model
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        import torch
        from tsr.system import TSR
        print("[TripoSR] Loading model weights...")
        model = TSR.from_pretrained(
            "stabilityai/TripoSR",
            config_name="config.yaml",
            weight_name="model.ckpt",
        )
        model.renderer.set_chunk_size(8192)
        model.to("cpu")
        _model = model
        print("[TripoSR] Model ready.")
    return _model


def preprocess_image(image_path: Path, foreground_ratio: float = 0.85) -> Image.Image:
    """Exact preprocessing from official TripoSR run.py."""
    from tsr.utils import remove_background, resize_foreground

    session = _get_rembg_session()
    image = remove_background(Image.open(image_path), session)
    image = resize_foreground(image, foreground_ratio)

    # Composite onto grey (0.5) background — exactly as official run.py
    image = np.array(image).astype(np.float32) / 255.0
    image = image[:, :, :3] * image[:, :, 3:4] + (1 - image[:, :, 3:4]) * 0.5
    image = Image.fromarray((image * 255.0).astype(np.uint8))
    return image


def generate_glb(image_path: Path) -> bytes:
    """Run TripoSR on image_path. Returns GLB bytes."""
    import torch

    print(f"[TripoSR] Preprocessing: {image_path.name}")
    image = preprocess_image(image_path, foreground_ratio=0.85)

    model = _load_model()

    print("[TripoSR] Running inference (2-5 min on CPU)...")
    with torch.no_grad():
        scene_codes = model([image], device="cpu")

    print("[TripoSR] Extracting mesh...")
    meshes = model.extract_mesh(scene_codes, True, resolution=128)
    mesh = meshes[0]

    tmp = Path(tempfile.mktemp(suffix=".glb"))
    mesh.export(str(tmp))
    data = tmp.read_bytes()
    tmp.unlink(missing_ok=True)

    print(f"[TripoSR] Done — {len(data)//1024}KB GLB")
    return data
