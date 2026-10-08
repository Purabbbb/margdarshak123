# MargDarshak — AI Resume Analyzer & Career Guidance Platform

MargDarshak is an NLP-powered resume analysis platform that processes your resume through a transparent 9-step pipeline — identifying skills, classifying job roles, finding skill gaps, recommending free courses, and matching live job listings in under 30 seconds.

---

## Features

- **Resume Parsing** — Extracts raw text from PDF using pdfminer.six
- **NLP Preprocessing** — 7-stage pipeline: lowercase → unicode cleanup → punctuation removal → whitespace normalization → tokenization → stopword removal → lemmatization
- **Entity Extraction** — Regex for email, phone, LinkedIn, GitHub. spaCy NER for name and location with Indian city fallback
- **Skill Extraction** — Exact word-boundary matching against 500+ skills across 15 categories
- **Job Role Classification** — Cosine similarity on skill vectors against O*NET-aligned role definitions
- **Skill Gap Analysis** — Set subtraction between required skills and resume skills
- **Course Recommendations** — Missing skills mapped to free Coursera, freeCodeCamp, and official doc resources
- **Live Job Matching** — Real-time listings from Adzuna API filtered by role and location
- **Career Chatbot** — Fully local intent classification across 9 intents, no external API
- **Pipeline Transparency** — Every step's output visible in the UI for demonstration

---

## NLP Pipeline

| Step | File | Method | Library |
|---|---|---|---|
| 1. Text Extraction | extractor.py | LAParams PDF parsing | pdfminer.six |
| 2. Preprocessing | preprocessor.py | 7-stage NLP pipeline | NLTK |
| 3. Entity Extraction | parser.py | Regex + Named Entity Recognition | re, spaCy |
| 4. Skill Extraction | skill_extractor.py | Exact string matching with word boundaries | Python re |
| 5. Job Classification | job_classifier.py | Cosine similarity on binary skill vectors | scikit-learn, numpy |
| 6. Gap Analysis | gap_analyzer.py | Set subtraction | Python sets |
| 7. Course Mapping | course_recommender.py | Dictionary lookup with partial match fallback | — |
| 8. Job Matching | job_matcher.py | REST API call | requests |
| 9. Chatbot | bot.py | Keyword-based intent classification | — |

Job role skill requirements are aligned with **O*NET Online** (U.S. Department of Labor, onetonline.org).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| NLP | NLTK, spaCy (en_core_web_sm), scikit-learn |
| PDF Parsing | pdfminer.six |
| Frontend | React 18, Vite, CSS Modules |
| Jobs API | Adzuna |
| Deployment | Render (backend), Vercel (frontend) |

---

## Local Setup

### Prerequisites
- Python 3.11 or 3.12
- Node.js 18+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('averaged_perceptron_tagger')"
cp .env.example .env
# Add your Adzuna API keys to .env
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Environment Variables

```
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
```

Get free Adzuna API keys at developer.adzuna.com (10,000 calls/month free).

### Image Resume OCR

The same `/analyze` endpoint accepts `.jpg`, `.jpeg`, `.png`, and `.webp`
files. Image resumes are preprocessed in memory and passed through Tesseract
OCR; the resulting text then uses the existing preprocessing and analysis
pipeline. PDF uploads continue to use pdfminer.six.

Install the Python OCR dependencies from `backend/requirements.txt` and
install the Tesseract OCR engine separately:

```bash
# Windows: install Tesseract OCR and ensure tesseract.exe is on PATH
# macOS: brew install tesseract
# Ubuntu/Debian: sudo apt-get install tesseract-ocr
```

If Tesseract is unavailable, image uploads return a clear configuration error;
PDF uploads remain unaffected.

---

## Project Structure

```
margdarshak/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── pipeline/
│   │   ├── extractor.py
│   │   ├── preprocessor.py
│   │   ├── parser.py
│   │   ├── skill_extractor.py
│   │   ├── job_classifier.py
│   │   ├── gap_analyzer.py
│   │   ├── course_recommender.py
│   │   └── job_matcher.py
│   ├── chatbot/
│   │   └── bot.py
│   └── data/
│       ├── skills_db.py
│       ├── job_roles.py
│       └── courses_db.py
└── frontend/
    └── src/
        ├── pages/
        └── components/
```

---

*Built with FastAPI, React, NLTK, spaCy, scikit-learn, and pdfminer.six*
