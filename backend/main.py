"""
main.py
-------
FastAPI application entry point.

Routes:
  POST /analyze      — Upload PDF, run full 9-step pipeline
  POST /jobs         — Fetch live jobs for a role + location
  POST /chat         — Send message to chatbot
  GET  /health       — Health check
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import uvicorn
from dotenv import load_dotenv

load_dotenv()

# Pipeline imports
from pipeline.extractor import extract_text_from_pdf
from pipeline.ocr_extractor import extract_text_from_image
from pipeline.preprocessor import preprocess
from pipeline.parser import parse_entities
from pipeline.skill_extractor import extract_skills
from pipeline.job_classifier import classify_job_roles
from pipeline.gap_analyzer import analyze_gaps
from pipeline.course_recommender import recommend_courses
from pipeline.job_matcher import fetch_jobs
from chatbot.bot import chat

# Teacher Recommendation imports
from teacher_matching.schemas import TeacherRecommendRequest, TeacherRecommendResponse, StudentRecommendResponse
from teacher_matching.teacher_matcher import TeacherMatcher
from teacher_matching.student_matcher import recommend_students

# Resume Roaster & Improvement imports
from resume_roaster.schemas import RoastResponse, ImprovementRequest, ImprovementResponse
from resume_roaster.roast_engine import RoastEngine
from resume_roaster.improvement_engine import ImprovementEngine

teacher_matcher = TeacherMatcher()
roast_engine = RoastEngine()
improvement_engine = ImprovementEngine()

app = FastAPI(
    title="MargDarshak API",
    description="AI Resume Analyzer and Career Guidance Platform",
    version="1.0.0"
)

# Allow requests from the React frontend (running on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request/Response Models ----------

class ChatRequest(BaseModel):
    message: str
    analysis: dict
    history: list = []


class JobRequest(BaseModel):
    job_title: str
    location: Optional[str] = None


# ---------- Routes ----------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "MargDarshak API",
        "health_check": "/health",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MargDarshak API"}


@app.post("/teachers/recommend", response_model=TeacherRecommendResponse)
def recommend_teachers_endpoint(request: TeacherRecommendRequest):
    """
    Hybrid Teacher / Mentor recommendation based on skill gaps,
    target role relevance, and optional preferences.
    """
    result = teacher_matcher.recommend_teachers(
        analysis=request.analysis,
        target_role=request.target_role,
        preferences=request.preferences,
        limit=request.limit or 6
    )
    return result


@app.get("/teachers/{teacher_id}/students", response_model=StudentRecommendResponse)
def recommend_students_endpoint(teacher_id: str, top_skills: Optional[str] = None):
    """Return students whose required skills overlap with a teacher's expertise."""
    teacher = teacher_matcher.repo.get_by_id(teacher_id)
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")
    selected_top_skills = (
        [skill.strip() for skill in top_skills.split(",") if skill.strip()][:5]
        if top_skills
        else (teacher.top_skills or teacher.skills[:5])
    )
    expertise = teacher.expertise_strengths or {
        skill.lower(): "high" for skill in selected_top_skills
    }
    return recommend_students(teacher.id, selected_top_skills, expertise)


@app.post("/resume/roast", response_model=RoastResponse)
async def roast_resume_endpoint(
    file: UploadFile = File(...),
    target_role: str = Form("Software Engineer"),
    tone: str = Form("balanced"),
    analysis_context: Optional[str] = Form(None)
):
    """
    Resume Roaster endpoint.
    Takes original resume PDF, selected target role, roast tone, and prior analysis context.
    Returns deterministic quality scoring, section critique, and constructive witty roast.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for resume roasting.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded resume file is empty.")

    extraction = extract_text_from_pdf(pdf_bytes)
    if extraction.get("status") == "error":
        raise HTTPException(
            status_code=422,
            detail="Resume text could not be analyzed. Please upload a text-based PDF."
        )

    raw_text = extraction.get("raw_text", "")
    if len(raw_text.strip()) < 40:
        raise HTTPException(
            status_code=422,
            detail="Insufficient readable text found in PDF. Please ensure the PDF has selectable text."
        )

    context_dict = {}
    if analysis_context:
        try:
            context_dict = json.loads(analysis_context)
        except Exception:
            context_dict = {}

    roast_result = roast_engine.roast_resume(
        resume_text=raw_text,
        target_role=target_role,
        tone=tone,
        analysis_context=context_dict
    )
    return roast_result


@app.post("/resume/improve", response_model=ImprovementResponse)
def improve_resume_endpoint(request: ImprovementRequest):
    """
    Resume Improvement endpoint.
    Transforms passive bullets to active achievement-oriented phrasing, fixes cliches,
    and recalculates transparent before vs after score metrics.
    """
    result = improvement_engine.improve_resume(
        resume_text=request.resume_text,
        target_role=request.target_role,
        selected_issues=request.selected_issues,
        analysis_context=request.analysis_context
    )
    return result


@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """
    Full resume analysis pipeline. PDF and image files share all stages after
    document-to-text extraction.
    """
    filename = (file.filename or "").lower()
    image_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    is_pdf = filename.endswith(".pdf")
    is_image = any(filename.endswith(extension) for extension in image_extensions)
    if not is_pdf and not is_image:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a PDF, JPG, JPEG, PNG, or WEBP resume.",
        )

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # ---- Step 1: Extract text ----
    extraction = extract_text_from_pdf(file_bytes) if is_pdf else extract_text_from_image(file_bytes)
    if extraction["status"] == "error":
        raise HTTPException(status_code=422, detail=extraction["message"])

    raw_text = extraction["raw_text"]

    # ---- Step 2: Preprocess ----
    preprocessing = preprocess(raw_text)

    # ---- Step 3: Parse entities ----
    entities = parse_entities(raw_text)

    # ---- Step 4: Extract skills ----
    skills = extract_skills(
        preprocessing["clean_text"],
        preprocessing["tokens"]
    )

    # ---- Step 5: Classify job roles ----
    job_roles = classify_job_roles(skills["matched_skills"])

    # ---- Step 6: Skill gap analysis ----
    gaps = analyze_gaps(
        skills["matched_skills"],
        job_roles["top_roles"]
    )

    # ---- Step 7: Course recommendations ----
    courses = recommend_courses(gaps["gaps"])

    # ---- Step 8: Job matching (auto-fetch for best role) ----
    best_role = job_roles.get("best_match", {})
    job_title = best_role.get("role", "Software Engineer") if best_role else "Software Engineer"
    location = entities.get("location")
    jobs = fetch_jobs(job_title, location)

    # ---- Assemble full response ----
    return {
        "status": "success",
        "filename": file.filename,
        "pipeline": {
            "step1_extraction": {
                "char_count": extraction["char_count"],
                "word_count": extraction["word_count"],
                "raw_text_preview": raw_text[:400],
                "source_type": extraction.get("source_type", "pdf"),
                "ocr_used": extraction.get("ocr_used", False),
            },
            "step2_preprocessing": {
                "stages": preprocessing["stages"],
                "token_count": preprocessing["token_count"]
            },
            "step3_entities": entities,
            "step4_skills": skills,
            "step5_job_roles": job_roles,
            "step6_gaps": gaps,
            "step7_courses": courses,
            "step8_jobs": jobs
        },
        # Flattened for easy frontend consumption
        "entities": entities,
        "skills": skills,
        "job_roles": job_roles,
        "gaps": gaps,
        "courses": courses,
        "jobs": jobs
    }


@app.post("/jobs")
def get_jobs(request: JobRequest):
    """Fetch jobs for a specific role and location (user-adjustable)."""
    result = fetch_jobs(request.job_title, request.location)
    return result


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    """Chatbot endpoint. Receives message + full analysis context."""
    result = chat(request.message, request.analysis, request.history)
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
