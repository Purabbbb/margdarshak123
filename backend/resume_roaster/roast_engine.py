"""
roast_engine.py
---------------
Main orchestrator for the Resume Roaster module.
Combines deterministic quality scoring, section issue extraction, and LLM-assisted roast generation.
"""

from typing import Dict, Any, Optional
try:
    from backend.resume_roaster.schemas import RoastResponse
    from backend.resume_roaster.scoring import score_resume
    from backend.resume_roaster.resume_analyzer import analyze_resume_issues, segment_resume_sections
    from backend.resume_roaster.llm_client import LLMClient
    from backend.data.job_roles import JOB_ROLES
except ModuleNotFoundError:
    from resume_roaster.schemas import RoastResponse
    from resume_roaster.scoring import score_resume
    from resume_roaster.resume_analyzer import analyze_resume_issues, segment_resume_sections
    from resume_roaster.llm_client import LLMClient
    from data.job_roles import JOB_ROLES


class RoastEngine:
    def __init__(self):
        self.llm = LLMClient()

    def roast_resume(
        self,
        resume_text: str,
        target_role: str = "Software Engineer",
        tone: str = "balanced",
        analysis_context: Optional[Dict[str, Any]] = None
    ) -> RoastResponse:
        """
        Executes the full resume quality scoring and roast generation workflow.
        """
        # 1. Deterministic scoring
        scores = score_resume(
            resume_text=resume_text,
            target_role=target_role
        )

        # 2. Section and issue analysis
        issues = analyze_resume_issues(
            resume_text=resume_text,
            target_role=target_role,
            analysis_context=analysis_context
        )

        # 3. LLM Roast generation
        roast_meta = self.llm.generate_roast_content(
            resume_text=resume_text,
            target_role=target_role,
            tone=tone,
            score=scores.overall_score,
            issues=[issue.dict() for issue in issues]
        )

        # 4. Generate Top 3 quick fixes
        top_fixes = []
        for issue in issues[:3]:
            top_fixes.append(f"{issue.section}: {issue.suggestion}")

        if not top_fixes:
            top_fixes = [
                "Quantify your key accomplishments with metrics (%, $, scale).",
                f"Verify ATS keyword alignment with required {target_role} competencies.",
                "Ensure clean visual hierarchy with consistent bullet points."
            ]

        # 5. Extract ATS keywords to consider
        role_info = JOB_ROLES.get(target_role, {})
        required_skills = role_info.get("required", [])
        text_lower = resume_text.lower()
        missing_ats_keywords = [
            s.title() for s in required_skills if s.lower() not in text_lower
        ]

        # 6. Sample revised sections preview
        sections = segment_resume_sections(resume_text)
        revised_sections = {}
        if "summary" in sections:
            revised_sections["summary"] = (
                f"{target_role.title()} with demonstrated experience building production-grade systems. "
                f"Proficient in {', '.join(s.title() for s in required_skills[:3])}."
            )

        return RoastResponse(
            status="success",
            overall_score=scores.overall_score,
            tone=tone,
            headline_roast=roast_meta.get("headline_roast", "Your resume deserves the truth — preferably with jokes."),
            summary=roast_meta.get("summary", "Analysis completed."),
            issues=issues,
            section_scores=scores,
            top_fixes=top_fixes,
            ats_keywords_to_consider=missing_ats_keywords[:6],
            revised_sections=revised_sections,
            method="MargDarshak Resume Quality Estimate & Roast Engine"
        )
