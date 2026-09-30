"""Inference preprocessing."""

import cv2 as cv
import numpy as np
import torch
import torchvision.transforms as transforms
from PIL import Image


IMG_SIZE = 224

val_transforms = transforms.Compose(
    [
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)


class InvalidImageError(ValueError):
    pass


def mri_preprocessing(image: np.ndarray) -> np.ndarray:
    gray = cv.cvtColor(image, cv.COLOR_RGB2GRAY)
    gray = cv.GaussianBlur(gray, (5, 5), 0)
    thresh = cv.threshold(gray, 45, 255, cv.THRESH_BINARY)[1]

    cnts = cv.findContours(
        thresh.copy(),
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE,
    )
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]

    if cnts:
        c = max(cnts, key=cv.contourArea)
        x, y, w, h = cv.boundingRect(c)
        image = image[y : y + h, x : x + w]

    gray_cropped = cv.cvtColor(image, cv.COLOR_RGB2GRAY)

    clahe = cv.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )

    res = clahe.apply(gray_cropped)

    return cv.cvtColor(res, cv.COLOR_GRAY2RGB)


def preprocess_image_bytes(data: bytes) -> torch.Tensor:
    arr = np.frombuffer(data, dtype=np.uint8)
    image = cv.imdecode(arr, cv.IMREAD_COLOR)

    if image is None:
        raise InvalidImageError(
            "Could not decode image. Upload a valid JPG/PNG."
        )

    image = cv.cvtColor(image, cv.COLOR_BGR2RGB)
    image = mri_preprocessing(image)
    image = Image.fromarray(image)

    return val_transforms(image).unsqueeze(0)