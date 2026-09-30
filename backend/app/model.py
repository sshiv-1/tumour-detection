"""ResNet18 architecture + checkpoint loading."""

from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models


CLASS_TO_IDX = {
    "glioma": 0,
    "meningioma": 1,
    "notumor": 2,
    "pituitary": 3,
}

CLASS_NAMES = [
    name for name, _ in sorted(CLASS_TO_IDX.items(), key=lambda kv: kv[1])
]

NUM_CLASSES = len(CLASS_NAMES)

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "best_brain_tumor_resnet18.pth"
)


def build_model() -> nn.Module:
    model = models.resnet18(weights=None)

    model.fc = nn.Sequential(
        nn.Linear(512, 512),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(512, NUM_CLASSES),
    )

    return model


def load_model(
    path: Path = MODEL_PATH,
    device: str | torch.device = "cpu",
) -> nn.Module:
    if not Path(path).exists():
        raise FileNotFoundError(f"Model weights not found at {path}")

    checkpoint = torch.load(path, map_location=device)

    state_dict = (
        checkpoint["model_state_dict"]
        if "model_state_dict" in checkpoint
        else checkpoint
    )

    model = build_model()
    model.load_state_dict(state_dict, strict=True)
    model.to(device)
    model.eval()

    return model