"""
3D Scanner Backend — FastAPI + Local TripoSR (100% free, no API key needed)
"""
import uuid
import asyncio
import traceback
from pathlib import Path
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

from config import CORS_ORIGINS, UPLOADS_DIR, MAX_IMAGES, MAX_FILE_SIZE_MB

app = FastAPI(title="3D Scanner API — Local TripoSR", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for CPU-bound TripoSR inference
_executor = ThreadPoolExecutor(max_workers=1)

# In-memory job store: job_id -> {status, glb_bytes, error}
_jobs: dict = {}


class UploadResponse(BaseModel):
    upload_id: str
    count: int
    message: str


class GenerateRequest(BaseModel):
    upload_id: str


class GenerateResponse(BaseModel):
    job_id: str
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str          # queued | processing | done | error
    message: str
    model_url: Optional[str] = None


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "3.0.0", "provider": "local-triposr"}


@app.post("/api/upload", response_model=UploadResponse)
async def upload_images(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(400, "No files provided.")
    if len(files) > MAX_IMAGES:
        raise HTTPException(400, f"Maximum {MAX_IMAGES} images allowed.")

    upload_id = str(uuid.uuid4())
    upload_dir = UPLOADS_DIR / upload_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    saved = 0
    for i, f in enumerate(files):
        ct = f.content_type or ""
        if not ct.startswith("image/"):
            continue
        ext = ".png" if "png" in ct else ".jpg"
        content = await f.read()
        if len(content) / (1024 * 1024) > MAX_FILE_SIZE_MB:
            continue
        (upload_dir / f"img_{i:04d}{ext}").write_bytes(content)
        saved += 1

    if saved == 0:
        raise HTTPException(400, "No valid images were saved.")
    return UploadResponse(upload_id=upload_id, count=saved,
                          message=f"{saved} image(s) uploaded.")


def _run_triposr(job_id: str, image_path: Path):
    """Runs in thread pool — calls local TripoSR and stores GLB bytes."""
    try:
        _jobs[job_id]["status"] = "processing"
        _jobs[job_id]["message"] = "Running TripoSR inference (2-5 min on CPU)..."
        from local_triposr import generate_glb
        glb = generate_glb(image_path)
        _jobs[job_id]["status"] = "done"
        _jobs[job_id]["message"] = "3D model ready!"
        _jobs[job_id]["glb_bytes"] = glb
    except Exception as e:
        traceback.print_exc()
        _jobs[job_id]["status"] = "error"
        _jobs[job_id]["message"] = str(e)


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_3d(req: GenerateRequest):
    """Start local TripoSR job. Poll /api/job/{job_id} for status."""
    upload_dir = UPLOADS_DIR / req.upload_id
    if not upload_dir.exists():
        raise HTTPException(404, "Upload not found.")

    images = sorted(upload_dir.glob("*.jpg")) + sorted(upload_dir.glob("*.png"))
    if not images:
        raise HTTPException(400, "No images found.")

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "queued", "message": "Queued.", "glb_bytes": None}

    loop = asyncio.get_event_loop()
    loop.run_in_executor(_executor, _run_triposr, job_id, images[0])

    return GenerateResponse(job_id=job_id,
                            message="Job started. Poll /api/job/{job_id}.")


@app.get("/api/job/{job_id}", response_model=JobStatusResponse)
async def job_status(job_id: str):
    if job_id not in _jobs:
        raise HTTPException(404, "Job not found.")
    job = _jobs[job_id]
    model_url = f"/api/model/{job_id}" if job["status"] == "done" else None
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        message=job["message"],
        model_url=model_url,
    )


@app.get("/api/model/{job_id}")
async def get_model(job_id: str):
    """Download the generated GLB file."""
    if job_id not in _jobs or _jobs[job_id]["status"] != "done":
        raise HTTPException(404, "Model not ready.")
    glb = _jobs[job_id]["glb_bytes"]
    return Response(
        content=glb,
        media_type="model/gltf-binary",
        headers={"Content-Disposition": f"inline; filename=model.glb"},
    )
