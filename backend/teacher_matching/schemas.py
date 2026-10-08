"""
schemas.py
----------
Pydantic schemas for the Teacher Recommendation / Expert Matching module.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TeacherProfile(BaseModel):
    id: str
    name: str
    headline: str
    bio: str
    skills: List[str]
    top_skills: List[str] = []
    domains: List[str]
    experience_years: int
    teaching_experience_years: int
    rating: float = Field(..., ge=1.0, le=5.0)
    sessions_completed: int
    teaching_style: List[str]
    languages: List[str]
    mode: List[str]
    availability: str
    hourly_rate: Optional[str] = "$45/hr"
    profile_url: Optional[str] = None
    verified: bool = True
    projects: List[str] = []
    certifications: List[str] = []
    expertise_strengths: Dict[str, str] = {}


class TeacherPreferences(BaseModel):
    mode: Optional[str] = None            # "online", "hybrid", "offline"
    language: Optional[str] = None        # "English", "Hindi", etc.
    level: Optional[str] = None           # "beginner", "intermediate", "advanced"
    teaching_style: Optional[str] = None  # "project-based", "hands-on", "interview-prep", etc.
    availability: Optional[str] = None
    budget: Optional[str] = None


class TeacherRecommendRequest(BaseModel):
    analysis: Dict[str, Any]
    target_role: Optional[str] = None
    preferences: Optional[TeacherPreferences] = None
    limit: int = 6


class TeacherRecommendation(BaseModel):
    rank: int
    teacher: TeacherProfile
    overall_match: float
    skill_coverage: float
    matched_skills: List[str]
    missing_teacher_coverage: List[str]
    semantic_similarity: float
    role_relevance: float
    experience_score: float
    rating_score: float
    reason: str


class TeacherRecommendResponse(BaseModel):
    status: str = "success"
    target_role: str
    skill_gaps: List[str]
    recommendations: List[TeacherRecommendation]
    method: str = "hybrid semantic + skill coverage + role relevance ranking"


class StudentNeed(BaseModel):
    id: str
    name: str
    email: str
    required_skills: List[str]
    profile: str


class StudentRecommendation(BaseModel):
    rank: int
    student: StudentNeed
    match_score: float
    matched_skills: List[str]
    evidence: List[str]


class StudentRecommendResponse(BaseModel):
    status: str = "success"
    teacher_id: str
    recommendations: List[StudentRecommendation]
    method: str = "normalized skill overlap + teacher expertise evidence"
