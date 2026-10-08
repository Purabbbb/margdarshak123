"""
preprocessor.py
---------------
PIPELINE STEP 2: Text Preprocessing

Takes raw extracted text and runs the full NLP preprocessing pipeline.
Each stage is a separate function — demonstrable independently.

Stages (in order):
  1. Lowercase normalization
  2. Unicode/encoding cleanup
  3. Punctuation & special character removal
  4. Whitespace normalization
  5. Tokenization (word-level)
  6. Stopword removal
  7. Lemmatization

Why this order:
  - Lowercase first so stopword lists match
  - Punctuation removal before tokenization to avoid token artifacts
  - Stopwords before lemmatization for efficiency
  - Lemmatization last so it operates on clean tokens
"""

import re
import unicodedata
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download required NLTK resources (safe to call multiple times)
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

# Initialize once at module level for performance
lemmatizer = WordNetLemmatizer()
STOP_WORDS = set(stopwords.words('english'))

# Additional domain-specific stopwords to remove from resumes
RESUME_STOPWORDS = {
    'etc', 'like', 'also', 'using', 'used', 'use', 'worked', 'work',
    'experience', 'knowledge', 'ability', 'skills', 'skill', 'year',
    'years', 'month', 'months', 'responsible', 'responsibilities',
    'including', 'various', 'multiple', 'well', 'good', 'strong',
    'excellent', 'proficient', 'familiar', 'working', 'developed',
    'developed', 'implemented', 'designed', 'built', 'created', 'managed'
}

ALL_STOPWORDS = STOP_WORDS.union(RESUME_STOPWORDS)


# ---------- Individual Stage Functions ----------

def stage_lowercase(text: str) -> str:
    """Stage 1: Convert all text to lowercase."""
    return text.lower()


def stage_unicode_cleanup(text: str) -> str:
    """Stage 2: Normalize unicode characters (handles accented chars, special dashes, etc.)"""
    # Normalize to NFKD form — decomposes combined characters
    text = unicodedata.normalize('NFKD', text)
    # Encode to ASCII, ignoring characters that can't convert, then decode back
    text = text.encode('ascii', 'ignore').decode('ascii')
    return text


def stage_remove_punctuation(text: str) -> str:
    """
    Stage 3: Remove punctuation and special characters.
    Keeps: alphanumeric, spaces, dots (for version numbers like python3.9),
           plus signs and hash for skills like C++ and C#, forward slash for terms like CI/CD.
    """
    # Keep alphanumeric and specific characters relevant to tech skills
    text = re.sub(r'[^a-z0-9\s\.\+\#\/\-]', ' ', text)
    # Remove standalone dots/dashes that aren't part of a word
    text = re.sub(r'(?<!\w)[.\-](?!\w)', ' ', text)
    return text


def stage_normalize_whitespace(text: str) -> str:
    """Stage 4: Collapse multiple spaces/newlines into single spaces."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def stage_tokenize(text: str) -> list:
    """
    Stage 5: Tokenize the cleaned text into individual word tokens.
    Uses NLTK's word_tokenize which handles contractions and punctuation better
    than a simple split().
    """
    tokens = word_tokenize(text)
    # Keep only tokens that are at least 2 characters (removes lone chars and noise)
    tokens = [t for t in tokens if len(t) >= 2]
    return tokens


def stage_remove_stopwords(tokens: list) -> list:
    """Stage 6: Remove stopwords from token list."""
    return [token for token in tokens if token not in ALL_STOPWORDS]


def stage_lemmatize(tokens: list) -> list:
    """
    Stage 7: Lemmatize tokens — reduce words to their base form.
    Examples: 'managing' -> 'manage', 'databases' -> 'database', 'running' -> 'run'
    """
    return [lemmatizer.lemmatize(token) for token in tokens]


# ---------- Main Pipeline Function ----------

def preprocess(raw_text: str) -> dict:
    """
    Runs the full preprocessing pipeline on raw extracted text.

    Args:
        raw_text: Raw text string from extractor.py

    Returns:
        dict with each stage's output (for transparency/demo) and final tokens
    """
    stages = {}

    # Stage 1
    s1 = stage_lowercase(raw_text)
    stages["1_lowercase"] = s1[:500] + "..." if len(s1) > 500 else s1

    # Stage 2
    s2 = stage_unicode_cleanup(s1)
    stages["2_unicode_cleanup"] = s2[:500] + "..." if len(s2) > 500 else s2

    # Stage 3
    s3 = stage_remove_punctuation(s2)
    stages["3_punctuation_removed"] = s3[:500] + "..." if len(s3) > 500 else s3

    # Stage 4
    s4 = stage_normalize_whitespace(s3)
    stages["4_whitespace_normalized"] = s4[:500] + "..." if len(s4) > 500 else s4

    # Stage 5
    tokens = stage_tokenize(s4)
    stages["5_tokens"] = tokens[:50]  # First 50 tokens for demo

    # Stage 6
    tokens_no_stop = stage_remove_stopwords(tokens)
    stages["6_stopwords_removed"] = tokens_no_stop[:50]

    # Stage 7
    final_tokens = stage_lemmatize(tokens_no_stop)
    stages["7_lemmatized"] = final_tokens[:50]

    return {
        "stages": stages,
        "clean_text": s4,              # Used by regex parser in Step 3
        "tokens": final_tokens,        # Used by skill extractor in Step 4
        "token_count": len(final_tokens),
        "raw_text_preview": raw_text[:300]
    }
