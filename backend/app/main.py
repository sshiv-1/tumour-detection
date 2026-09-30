from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .inference import predict_tensor
from .model import load_model
from .preprocessing import InvalidImageError, preprocess_image_bytes
from .schemas import HealthResponse, PredictionResponse


MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg"}


state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    device = "cuda" if torch.cuda.is_available() else "cpu"

    state["device"] = device
    state["model"] = load_model(device=device)

    yield

    state.clear()


app = FastAPI(
    title="Brain Tumor MRI Classifier",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://tumour-detection-six.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        model_loaded="model" in state,
        device=state.get("device", "unknown"),
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            415,
            f"Unsupported file type: {file.content_type}",
        )

    data = await file.read()

    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            413,
            "File too large (max 10 MB).",
        )

    try:
        tensor = preprocess_image_bytes(data)
    except InvalidImageError as e:
        raise HTTPException(400, str(e))

    return predict_tensor(
        state["model"],
        tensor,
        state["device"],
    )