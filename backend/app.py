from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F 
import json
import os
from typing import Literal
from pathlib import Path
from backend.languages import LANGUAGE_NAMES

HERE = Path(__file__).resolve()
PROJECT_DIR = HERE.parent.parent
MODEL_VERSION = "1_20250703_214512"
# model_path = f"models/{MODEL_VERSION}"
MODEL_DIR = "models/1_20250703_013444"
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_DIR,
    )
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_DIR,
    )
model.to(DEVICE)
model.eval()

class TextDetectRequest(BaseModel):
    text: str

class DetectionResult(BaseModel):
    language: str
    confidence: float
    inputType: Literal["text"]

app = FastAPI()

@app.get("/")
def read_root():
    return {"hello": "world"}

# text detection endpoint
@app.post("/api/detect-text", response_model=DetectionResult)
def detect_text(req: TextDetectRequest):
    inputs = tokenizer(
        req.text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=128,
    ).to(DEVICE)

    with torch.no_grad():
        logits = model(**inputs).logits

    probs = F.softmax(logits, dim=-1)[0]
    idx   = int(torch.argmax(probs))
    label = model.config.id2label[idx]
    language = LANGUAGE_NAMES.get(label, label)
    score = float(probs[idx].cpu().item()) * 100

    return DetectionResult(language=language, # type: ignore
        confidence=score,
        inputType="text")