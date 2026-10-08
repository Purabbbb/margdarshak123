"""
download_model.py
-----------------
Downloads the DistilBERT intent classifier model from Google Drive.
Run this once on Render during the build step.
"""

import os
import gdown
from pathlib import Path

MODEL_DIR = Path(__file__).parent / "intent_classifier"
MODEL_FILE = MODEL_DIR / "model.safetensors"
FILE_ID = "1XbvQtB0m87EMlQ3AWO3QP3Z-88yPtdkT"  # paste your file ID here

def download_model():
    if MODEL_FILE.exists():
        print("Model already exists, skipping download.")
        return
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print("Downloading DistilBERT model from Google Drive...")
    url = f"https://drive.google.com/uc?id={FILE_ID}"
    gdown.download(url, str(MODEL_FILE), quiet=False)
    print("Model downloaded successfully.")

if __name__ == "__main__":
    download_model()