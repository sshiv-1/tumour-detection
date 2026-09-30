"""Tensor -> class, confidence, probabilities."""
import torch
import torch.nn as nn

from .model import CLASS_NAMES


@torch.inference_mode()
def predict_tensor(model: nn.Module, tensor: torch.Tensor, device: str | torch.device = "cpu") -> dict:
    model.eval()
    logits = model(tensor.to(device))
    probs = torch.softmax(logits, dim=1)[0].cpu()

    idx = int(torch.argmax(probs))
    return {
        "predicted_class": CLASS_NAMES[idx],
        "confidence": float(probs[idx]),
        "probabilities": {name: float(p) for name, p in zip(CLASS_NAMES, probs)},
    }
