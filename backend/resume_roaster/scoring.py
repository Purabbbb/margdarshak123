"""
scoring.py
----------
Deterministic Resume Quality Scoring Engine.

Evaluates 7 sub-scores + 1 overall score (all 0-100):
- Structure (section completeness, header detection, formatting)
- Clarity (readability, sentence length, passive vs active)
- Impact (quantifiable metrics, numbers, strong action verbs)
- ATS Alignment (target role keyword coverage)
- Skill Evidence (concrete skills demonstrated in context)
- Role Relevance (alignment with selected target role)
- Conciseness (absence of clichés, filler buzzwords, and fluff)

Label: "MargDarshak Resume Quality Estimate"
Transparent, deterministic, reproducible.
"""

import re
from typing import Dict, Any, List, Tuple, Optional
try:
    from backend.resume_roaster.schemas import SectionScores
    from backend.data.skills_db import SKILLS_DB
    from backend.data.job_roles import JOB_ROLES
except ModuleNotFoundError:
    from resume_roaster.schemas import SectionScores
    from data.skills_db import SKILLS_DB
    from data.job_roles import JOB_ROLES

# Strong achievement-oriented action verbs
STRONG_ACTION_VERBS = {
    "accelerated", "achieved", "analyzed", "architected", "automated", "built",
    "centralized", "configured", "consolidated", "converted", "created", "decreased",
    "delivered", "deployed", "designed", "developed", "devised", "eliminated",
    "engineered", "enhanced", "established", "executed", "expanded", "expedited",
    "formulated", "generated", "implemented", "improved", "increased", "initiated",
    "innovated", "installed", "instituted", "integrated", "launched", "led",
    "maximized", "migrated", "minimized", "modernized", "monitored", "negotiated",
    "optimized", "orchestrated", "overhauled", "pioneered", "reduced", "reengineered",
    "refactored", "resolved", "restructured", "revamped", "saved", "scaled",
    "secured", "simplified", "spearheaded", "standardized", "streamlined", "surpassed",
    "transformed", "upgraded", "validated"
}

# Weak passive or non-committal phrases
WEAK_PHRASES = [
    r"\bresponsible for\b",
    r"\bduties included\b",
    r"\bworked on\b",
    r"\bhelped with\b",
    r"\btasked with\b",
    r"\bassisted in\b",
    r"\bparticipated in\b",
    r"\bhandled\b",
    r"\binvolved in\b",
    r"\btried to\b",
]

# Cliché filler buzzwords
CLICHE_BUZZWORDS = [
    r"\bhard[\s-]working\b",
    r"\bteam player\b",
    r"\bresults[\s-]driven\b",
    r"\bresults[\s-]oriented\b",
    r"\bpassionate\b",
    r"\bgo[\s-]getter\b",
    r"\bdetail[\s-]oriented\b",
    r"\bsynergy\b",
    r"\bthink outside the box\b",
    r"\bself[\s-]starter\b",
    r"\bproblem[\s-]solver\b",
    r"\bdynamic\b",
    r"\bproven track record\b",
    r"\benthusiastic\b",
    r"\bexpert in everything\b",
]

# Quantifiable metric patterns: numbers, %, $, Xx improvement, K/M scale
METRIC_PATTERNS = [
    r"\b\d+%\b",                           # 35%, 100%
    r"\$\s*\d+[\d,]*(\.\d+)?[kKmMbB]?\b", # $50K, $1.2M
    r"\b\d+[\d,]*\s*(users|customers|clients|requests|qps|records|downloads|models|pipelines)\b",
    r"\b\d+(\.\d+)?\s*(x|times)\b",        # 2x, 5 times
    r"\b\d+(\.\d+)?\s*(ms|seconds|minutes|hours|days|weeks|months)\b", # 200ms, 4 weeks
    r"\b(reduced|increased|boosted|saved|cut)\s+(by\s+)?\d+%\b",
    r"\b\d+\+\b",                          # 50+, 500+
    r"\[\s*add\s+a?\s*metric[^\]]*\]",     # explicitly marked improvement placeholder
]


def score_resume(
    resume_text: str,
    target_role: str = "Software Engineer",
    extracted_skills: Optional[List[str]] = None
) -> SectionScores:
    """
    Evaluates resume text deterministically across 7 dimensions and returns SectionScores.
    """
    text_lower = resume_text.lower()
    words = re.findall(r"\b[a-zA-Z0-9+#.-]+\b", resume_text)
    word_count = len(words)

    # 1. Structure (0 - 100)
    # Check section presence
    section_headers = ["experience", "education", "skills", "projects", "summary", "certifications"]
    found_headers = sum(1 for h in section_headers if re.search(r"\b" + h + r"\b", text_lower))
    header_score = (found_headers / len(section_headers)) * 70.0

    # Length suitability (ideal: 300 to 900 words for single-page student/professional resume)
    if word_count < 150:
        len_score = 30.0
    elif word_count < 300:
        len_score = 65.0
    elif word_count <= 950:
        len_score = 100.0
    elif word_count <= 1400:
        len_score = 80.0
    else:
        len_score = 60.0

    structure_score = int(round(0.6 * header_score + 0.4 * len_score))

    # 2. Clarity (0 - 100)
    # Check passive phrases
    weak_count = sum(len(re.findall(p, text_lower)) for p in WEAK_PHRASES)
    clarity_base = 88.0 - (weak_count * 6.0)

    # Bullet length check (lines with 5 - 35 words are clearer than 80-word run-on sentences)
    lines = [l.strip() for l in resume_text.split("\n") if len(l.strip()) > 10]
    run_on_count = sum(1 for l in lines if len(l.split()) > 45)
    clarity_base -= (run_on_count * 5.0)
    clarity_score = int(round(max(30.0, min(100.0, clarity_base))))

    # 3. Impact (0 - 100)
    # Metrics density
    metric_matches = sum(len(re.findall(p, text_lower)) for p in METRIC_PATTERNS)
    # Action verbs count
    action_verb_count = sum(1 for w in words if w.lower() in STRONG_ACTION_VERBS)

    metric_score = min(50.0, metric_matches * 10.0)
    verb_score = min(50.0, action_verb_count * 5.0)
    impact_score = int(round(metric_score + verb_score))
    impact_score = max(25, min(100, impact_score))

    # 4. ATS Alignment & Role Relevance (0 - 100)
    role_info = JOB_ROLES.get(target_role, {})
    required_role_skills = [s.lower() for s in role_info.get("required", [])]
    preferred_role_skills = [s.lower() for s in role_info.get("preferred", [])]

    if required_role_skills:
        req_present = sum(1 for s in required_role_skills if s in text_lower)
        pref_present = sum(1 for s in preferred_role_skills if s in text_lower)
        role_rel_raw = ((req_present * 2.0 + pref_present) / (len(required_role_skills) * 2.0 + len(preferred_role_skills))) * 100.0
        role_relevance_score = int(round(min(100.0, max(30.0, role_rel_raw))))
    else:
        role_relevance_score = 75

    # ATS alignment: keywords density + standard formatting signals
    ats_score = int(round(0.6 * role_relevance_score + 0.4 * structure_score))

    # 5. Skill Evidence (0 - 100)
    all_known_skills = []
    for cat_skills in SKILLS_DB.values():
        all_known_skills.extend(cat_skills)

    recognized_skills = set()
    for s in all_known_skills:
        if re.search(r"\b" + re.escape(s) + r"\b", text_lower):
            recognized_skills.add(s)

    skill_count = len(recognized_skills)
    if skill_count >= 15:
        skill_evidence_score = 95
    elif skill_count >= 10:
        skill_evidence_score = 85
    elif skill_count >= 6:
        skill_evidence_score = 72
    elif skill_count >= 3:
        skill_evidence_score = 55
    else:
        skill_evidence_score = 35

    # 6. Conciseness (0 - 100)
    cliche_count = sum(len(re.findall(p, text_lower)) for p in CLICHE_BUZZWORDS)
    conciseness_raw = 92.0 - (cliche_count * 10.0)
    if word_count > 1200:
        conciseness_raw -= 15.0
    conciseness_score = int(round(max(30.0, min(100.0, conciseness_raw))))

    # 7. Overall Score (Weighted combination)
    overall = int(round(
        0.20 * impact_score
        + 0.20 * role_relevance_score
        + 0.15 * ats_score
        + 0.15 * skill_evidence_score
        + 0.10 * structure_score
        + 0.10 * clarity_score
        + 0.10 * conciseness_score
    ))
    overall_score = max(20, min(98, overall))

    return SectionScores(
        overall_score=overall_score,
        structure=structure_score,
        clarity=clarity_score,
        impact=impact_score,
        ats_alignment=ats_score,
        skill_evidence=skill_evidence_score,
        role_relevance=role_relevance_score,
        conciseness=conciseness_score
    )
