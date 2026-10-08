"""
ocr_extractor.py
----------------
Image resume text extraction. The returned raw text is consumed by the same
preprocessing and analysis pipeline as PDF text.
"""

import io
import os
from typing import Dict


def extract_text_from_image(image_bytes: bytes) -> Dict[str, object]:
    """Preprocess an uploaded image and extract text with Tesseract OCR."""
    result = {
        "raw_text": "",
        "char_count": 0,
        "word_count": 0,
        "status": "error",
        "message": "",
        "source_type": "image",
        "ocr_used": True,
    }

    if not image_bytes:
        result["message"] = "Uploaded image is empty."
        return result

    try:
        from PIL import Image, ImageEnhance, ImageFilter, ImageOps
        import pytesseract
    except ImportError:
        result["message"] = (
            "Image OCR is not configured. Install Pillow and pytesseract, "
            "then install the Tesseract OCR engine."
        )
        return result

    try:
        if os.name == "nt" and os.path.exists(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
            pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
        if image.width < 80 or image.height < 80:
            result["message"] = "Image is too small to read. Please upload a clearer resume image."
            return result

        # Keep the original bytes untouched; preprocess only an in-memory copy.
        image = ImageOps.exif_transpose(image).convert("L")
        longest_side = max(image.size)
        if longest_side < 1800:
            scale = 1800 / longest_side
            image = image.resize(
                (round(image.width * scale), round(image.height * scale)),
                Image.Resampling.LANCZOS,
            )
        image = ImageOps.autocontrast(image)
        image = image.filter(ImageFilter.MedianFilter(size=3))
        image = ImageEnhance.Contrast(image).enhance(1.5)

        text = pytesseract.image_to_string(image, config="--psm 6")
        raw_text = text.strip()
        if len(raw_text) < 40 or len(raw_text.split()) < 8:
            result["message"] = (
                "Unable to extract readable text from this image. "
                "Please upload a clearer image of your resume."
            )
            return result

        result.update({
            "raw_text": raw_text,
            "char_count": len(raw_text),
            "word_count": len(raw_text.split()),
            "status": "success",
            "message": f"Extracted {len(raw_text.split())} words from image using OCR.",
        })
        return result
    except pytesseract.pytesseract.TesseractNotFoundError:
        result["message"] = (
            "Tesseract OCR is not installed or is not on PATH. "
            "Install Tesseract OCR and restart the backend."
        )
        return result
    except Exception as exc:
        result["message"] = f"Image OCR failed: {exc}"
        return result
