"""
test_suite.py
--------------
Automated end-to-end verification script for MargDarshak endpoints:
- Health check
- Teacher Recommendation Endpoint (POST /teachers/recommend)
- Resume Improvement Endpoint (POST /resume/improve)
- Chatbot Endpoint (POST /chat)
- Job Fetch Endpoint (POST /jobs)
"""

import sys
import os
import io
import json

sys.path.insert(0, os.path.dirname(__file__))

from main import (
    health_check,
    recommend_teachers_endpoint,
    improve_resume_endpoint,
    chat_endpoint,
    get_jobs,
    ChatRequest,
    JobRequest
)
from teacher_matching.schemas import TeacherRecommendRequest, TeacherPreferences
from resume_roaster.schemas import ImprovementRequest

def test_health():
    print("\n--- 1. Testing GET /health ---", flush=True)
    data = health_check()
    assert data["status"] == "ok"
    print("[PASS] /health passed:", data, flush=True)

def test_teacher_recommendation():
    print("\n--- 2. Testing POST /teachers/recommend ---", flush=True)
    req = TeacherRecommendRequest(
        analysis={
            "job_roles": {"best_match": {"role": "Data Analyst", "score": 82}},
            "skills": {"matched_skills": ["python", "excel", "pandas"]},
            "gaps": {
                "gaps": {
                    "Data Analyst": {
                        "missing_required": ["sql", "power bi"],
                        "missing_preferred": ["statistics", "tableau"]
                    }
                }
            }
        },
        target_role="Data Analyst",
        preferences=TeacherPreferences(
            mode="online",
            language="English",
            teaching_style="project-based"
        ),
        limit=5
    )

    data = recommend_teachers_endpoint(req)
    assert data.status == "success"
    assert data.target_role == "Data Analyst"
    assert len(data.recommendations) > 0
    top_rec = data.recommendations[0]
    assert top_rec.teacher.name is not None
    assert top_rec.overall_match > 0
    assert top_rec.skill_coverage > 0
    assert top_rec.reason is not None
    print(f"[PASS] /teachers/recommend passed. Top Match: {top_rec.teacher.name} ({top_rec.overall_match}%)", flush=True)
    print(f"  Reason: {top_rec.reason}", flush=True)

def test_resume_improve():
    print("\n--- 3. Testing POST /resume/improve ---", flush=True)
    resume_sample = (
        "SUMMARY\n"
        "Hardworking team player and results-driven individual looking for a position.\n\n"
        "EXPERIENCE\n"
        "- Responsible for creating python scripts and helped with database management.\n"
        "- Tasked with bug fixing and assisted in testing.\n\n"
        "PROJECTS\n"
        "- Built a machine learning model for classification.\n\n"
        "SKILLS\n"
        "Python, SQL, Excel"
    )

    req = ImprovementRequest(
        resume_text=resume_sample,
        target_role="Software Engineer",
        selected_issues=None
    )

    data = improve_resume_endpoint(req)
    assert data.status == "success"
    assert data.improved_score >= data.original_score
    assert len(data.changes) > 0
    print(f"[PASS] /resume/improve passed. Score: {data.original_score} -> {data.improved_score} (+{data.score_delta})", flush=True)
    for c in data.changes:
        print(f"  [{c.section}] Reason: {c.reason}", flush=True)

def test_chat():
    print("\n--- 4. Testing POST /chat ---", flush=True)
    req = ChatRequest(
        message="What is my best job match?",
        analysis={
            "entities": {"name": "Test User"},
            "job_roles": {"best_match": {"role": "Data Analyst", "score": 88}},
            "skills": {"matched_skills": ["python", "sql", "excel"]},
            "gaps": {"gaps": {}},
            "courses": [],
            "jobs": []
        },
        history=[]
    )
    data = chat_endpoint(req)
    assert "response" in data
    print("[PASS] /chat passed. Response snippet:", data["response"][:80], "...", flush=True)

def test_jobs():
    print("\n--- 5. Testing POST /jobs ---", flush=True)
    req = JobRequest(
        job_title="Software Engineer",
        location="India"
    )
    data = get_jobs(req)
    assert "jobs" in data
    print(f"[PASS] /jobs passed. Results count: {len(data['jobs'])}", flush=True)

if __name__ == "__main__":
    print("Running MargDarshak End-to-End Test Suite...")
    test_health()
    test_teacher_recommendation()
    test_resume_improve()
    test_chat()
    test_jobs()
    print("\n==========================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (100% GREEN)")
    print("==========================================")
