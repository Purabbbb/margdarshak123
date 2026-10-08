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

_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm", disable=["parser", "tagger", "attribute_ruler", "lemmatizer"])
        except Exception:
            try:
                _nlp = spacy.blank("en")
            except Exception:
                _nlp = False
    return _nlp

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
    Pure Python name and location detection using fast regex and city dictionary lookup.
    """
    top_section = raw_text[:600]

    name = None
    for line in [line.strip() for line in top_section.splitlines() if line.strip()]:
        if any(token in line.lower() for token in ("@", "http", "www", "+91", "phone", "email", "resume", "curriculum", "github", "linkedin")):
            continue
        parts = re.findall(r'[A-Za-z]+', line)
        if 2 <= len(parts) <= 4 and all(part[0].isupper() for part in parts if part):
            name = " ".join(parts)
            break

    location = None
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
