"""
schemas.py
----------
Pydantic schemas for the Resume Roaster and Resume Improvement modules.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class SectionScores(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    structure: int = Field(..., ge=0, le=100)
    clarity: int = Field(..., ge=0, le=100)
    impact: int = Field(..., ge=0, le=100)
    ats_alignment: int = Field(..., ge=0, le=100)
    skill_evidence: int = Field(..., ge=0, le=100)
    role_relevance: int = Field(..., ge=0, le=100)
    conciseness: int = Field(..., ge=0, le=100)


class ResumeIssue(BaseModel):
    id: str
    section: str
    severity: str  # "high", "medium", "low"
    category: str  # "weak_impact", "missing_metrics", "cliché_buzzwords", "vague_bullets", "missing_skills", "passive_voice"
    evidence: str
    roast: str
    why_it_matters: str
    suggestion: str
    rewrite_example: str


class RoastResponse(BaseModel):
    status: str = "success"
    overall_score: int
    tone: str  # "friendly", "balanced", "savage"
    headline_roast: str
    summary: str
    issues: List[ResumeIssue]
    section_scores: SectionScores
    top_fixes: List[str]
    ats_keywords_to_consider: List[str]
    revised_sections: Dict[str, str] = {}
    method: str = "MargDarshak Resume Quality Estimate & Roast Engine"


class ImprovementRequest(BaseModel):
    resume_text: str
    target_role: str
    selected_issues: Optional[List[str]] = None
    analysis_context: Optional[Dict[str, Any]] = None


class SectionChange(BaseModel):
    section: str
    before: str
    after: str
    reason: str


class ImprovementResponse(BaseModel):
    status: str = "success"
    target_role: str
    changes: List[SectionChange]
    revised_resume_text: str
    original_score: int
    improved_score: int
    score_delta: int
    section_scores: SectionScores
