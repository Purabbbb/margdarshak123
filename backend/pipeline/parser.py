"""
parser.py
---------
PIPELINE STEP 3: Entity Extraction

Extracts structured fields from the resume using two techniques:

  1. Regex — for well-structured patterns:
       - Email address
       - Phone number (Indian + international formats)
       - LinkedIn URL
       - GitHub URL

  2. spaCy NER (Named Entity Recognition) — for context-dependent fields:
       - Full name (PERSON entity near top of resume)
       - Location (GPE/LOC entity)

  3. Keyword-based city lookup — fallback for location when NER fails.
     Checks against a list of major Indian and global cities.
     This handles cases where spaCy does not tag a city as a GPE entity,
     which is common when resumes lack address formatting.
"""

import re
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
    SPACY_MODEL_READY = True
except OSError:
    nlp = spacy.blank("en")
    SPACY_MODEL_READY = False

# ---------- Major city list for fallback location detection ----------
KNOWN_CITIES = [
    # India - Tier 1
    "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai",
    "kolkata", "pune", "ahmedabad", "surat", "jaipur", "lucknow",
    "kanpur", "nagpur", "indore", "bhopal", "visakhapatnam", "patna",
    "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad",
    "meerut", "rajkot", "noida", "gurgaon", "gurugram", "chandigarh",
    "coimbatore", "kochi", "thiruvananthapuram", "mysuru", "mysore",
    "mangalore", "hubli", "dharwad", "aurangabad", "solapur", "amritsar",
    # Global
    "new york", "london", "singapore", "dubai", "san francisco",
    "seattle", "boston", "chicago", "toronto", "sydney", "berlin",
    "amsterdam", "paris", "tokyo", "hong kong"
]

# ---------- Regex Patterns ----------

EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

PHONE_PATTERN = re.compile(
    r'(?:\+91[\s\-]?|91[\s\-]?)?[6-9]\d{9}|'
    r'(?:\+\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]\d{3}[\s\-]\d{4}',
    re.IGNORECASE
)

LINKEDIN_PATTERN = re.compile(
    r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w\-]+/?',
    re.IGNORECASE
)

GITHUB_PATTERN = re.compile(
    r'(?:https?://)?(?:www\.)?github\.com/[\w\-]+/?',
    re.IGNORECASE
)


# ---------- Extraction Functions ----------

def extract_email(text):
    match = EMAIL_PATTERN.search(text)
    return match.group(0) if match else None

def extract_phone(text):
    match = PHONE_PATTERN.search(text)
    if match:
        return re.sub(r'[\s\-\(\)]', '', match.group(0))
    return None

def extract_linkedin(text):
    match = LINKEDIN_PATTERN.search(text)
    return match.group(0) if match else None

def extract_github(text):
    match = GITHUB_PATTERN.search(text)
    return match.group(0) if match else None


def extract_name_and_location(raw_text):
    """
    Uses spaCy NER for name and location detection.
    Falls back to city keyword lookup for location if NER finds nothing.
    """
    top_section = raw_text[:600]

    name = None
    if SPACY_MODEL_READY:
        doc_top = nlp(top_section)
        for ent in doc_top.ents:
            if ent.label_ == "PERSON":
                parts = ent.text.strip().split()
                if 2 <= len(parts) <= 4 and all(len(p) >= 2 for p in parts):
                    name = ent.text.strip()
                    break
    if not name:
        for line in [line.strip() for line in top_section.splitlines() if line.strip()]:
            if any(token in line.lower() for token in ("@", "http", "www", "+91")):
                continue
            parts = line.split()
            if 2 <= len(parts) <= 4 and all(part[:1].isupper() and part[1:].islower() for part in parts if part):
                name = line
                break

    location = None
    if SPACY_MODEL_READY:
        doc_full = nlp(raw_text[:2000])
        for ent in doc_full.ents:
            if ent.label_ in ("GPE", "LOC"):
                text = ent.text.strip()
                if len(text) >= 3:
                    location = text
                    break

    # Fallback: keyword scan against known city list
    if not location:
        text_lower = raw_text[:2000].lower()
        for city in KNOWN_CITIES:
            pattern = r'\b' + re.escape(city) + r'\b'
            if re.search(pattern, text_lower):
                location = city.title()
                break

    return {"name": name, "location": location}


def parse_entities(raw_text):
    """
    Runs all extraction steps and returns structured contact info.
    Uses raw_text (not preprocessed) so regex patterns work on original formatting.
    """
    ner_results = extract_name_and_location(raw_text)

    return {
        "name": ner_results.get("name"),
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "location": ner_results.get("location"),
        "linkedin": extract_linkedin(raw_text),
        "github": extract_github(raw_text),
        "_methods": {
            "name": "spaCy NER (PERSON entity)",
            "email": "Regex pattern",
            "phone": "Regex pattern (Indian + international formats)",
            "location": "spaCy NER (GPE/LOC entity) + city keyword fallback",
            "linkedin": "Regex pattern",
            "github": "Regex pattern"
        }
    }
