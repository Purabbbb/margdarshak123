"""
extractor.py
------------
PIPELINE STEP 1: Text Extraction

Extracts raw text from uploaded PDF resume using pdfminer.six.
Returns the raw string exactly as extracted — no cleaning at this stage.
Cleaning happens in preprocessor.py (Step 2).

Why pdfminer.six:
  - Pure Python, no external dependencies like poppler
  - Handles multi-column PDFs better than PyPDF2
  - Gives character-level control over extraction
"""

import io
from pdfminer.high_level import extract_text, extract_text_to_fp
from pdfminer.layout import LAParams


def extract_text_from_pdf(pdf_bytes: bytes) -> dict:
    """
    Extracts raw text from PDF bytes.
    """
    raw_text = ""
    try:
        output = io.StringIO()
        laparams = LAParams(
            line_overlap=0.5,
            char_margin=2.0,
            line_margin=0.5,
            word_margin=0.1,
            boxes_flow=0.5,
            detect_vertical=False,
            all_texts=False
        )
        extract_text_to_fp(
            io.BytesIO(pdf_bytes),
            output,
            laparams=laparams,
            output_type='text',
            codec='utf-8'
        )
        raw_text = output.getvalue()
    except Exception:
        raw_text = ""

    if not raw_text.strip():
        try:
            raw_text = extract_text(io.BytesIO(pdf_bytes)) or ""
        except Exception:
            raw_text = ""

    if not raw_text.strip():
        return {
            "raw_text": "",
            "char_count": 0,
            "word_count": 0,
            "status": "error",
            "message": "No text found in PDF. The file may be image-based. Please upload a text-based PDF or JPG/PNG image.",
            "source_type": "pdf",
            "ocr_used": False,
        }

    return {
        "raw_text": raw_text,
        "char_count": len(raw_text),
        "word_count": len(raw_text.split()),
        "status": "success",
        "message": f"Extracted {len(raw_text.split())} words from PDF.",
        "source_type": "pdf",
        "ocr_used": False,
    }
