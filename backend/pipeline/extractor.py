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
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams


def extract_text_from_pdf(pdf_bytes: bytes) -> dict:
    """
    Extracts raw text from PDF bytes.

    Args:
        pdf_bytes: Raw PDF file content as bytes

    Returns:
        dict with:
          - raw_text: the full extracted string
          - char_count: total characters
          - word_count: approximate word count
          - status: 'success' or 'error'
          - message: human-readable status
    """
    try:
        output = io.StringIO()

        # LAParams controls how pdfminer groups characters into words/lines
        laparams = LAParams(
            line_overlap=0.5,       # How much lines can overlap before merged
            char_margin=2.0,        # Max gap between chars to be considered same word
            line_margin=0.5,        # Max gap between lines to be considered same paragraph
            word_margin=0.1,        # Min gap to separate words
            boxes_flow=0.5,         # Controls reading order in multi-column layouts
            detect_vertical=False,  # Disable vertical text (not needed for resumes)
            all_texts=False         # Only extract text in normal flow
        )

        extract_text_to_fp(
            io.BytesIO(pdf_bytes),
            output,
            laparams=laparams,
            output_type='text',
            codec='utf-8'
        )

        raw_text = output.getvalue()

        if not raw_text.strip():
            return {
                "raw_text": "",
                "char_count": 0,
                "word_count": 0,
                "status": "error",
                "message": "No text found in PDF. The file may be image-based. Please upload a text-based PDF.",
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

    except Exception as e:
        return {
            "raw_text": "",
            "char_count": 0,
            "word_count": 0,
            "status": "error",
            "message": f"PDF extraction failed: {str(e)}",
            "source_type": "pdf",
            "ocr_used": False,
        }
