"""
resume_analyzer.py
------------------
Section-aware resume structural parser and issue detector.
Segments raw text into recognized sections and locates concrete,
evidence-based weaknesses (passive phrasing, absent metrics, buzzwords, missing role skills).
"""

import re
from typing import Dict, List, Any, Optional
try:
    from backend.resume_roaster.schemas import ResumeIssue
    from backend.resume_roaster.scoring import WEAK_PHRASES, CLICHE_BUZZWORDS, METRIC_PATTERNS
    from backend.data.job_roles import JOB_ROLES
except ModuleNotFoundError:
    from resume_roaster.schemas import ResumeIssue
    from resume_roaster.scoring import WEAK_PHRASES, CLICHE_BUZZWORDS, METRIC_PATTERNS
    from data.job_roles import JOB_ROLES

SECTION_HEADERS = [
    ("experience", [r"\bexperience\b", r"\bwork history\b", r"\bemployment\b", r"\bprofessional experience\b"]),
    ("projects", [r"\bprojects\b", r"\bacademic projects\b", r"\bkey projects\b", r"\bpersonal projects\b"]),
    ("skills", [r"\bskills\b", r"\btechnical skills\b", r"\bcore competencies\b", r"\btechnologies\b"]),
    ("education", [r"\beducation\b", r"\bacademics\b", r"\bacademic qualifications\b"]),
    ("summary", [r"\bsummary\b", r"\bprofessional summary\b", r"\bprofile\b", r"\babout me\b", r"\bobjective\b"]),
    ("certifications", [r"\bcertifications\b", r"\bcertificates\b", r"\blicenses\b", r"\bachievements\b"]),
]


def segment_resume_sections(text: str) -> Dict[str, str]:
    """
    Splits resume text into recognized standard sections.
    Returns mapping of section_name -> section_content.
    """
    lines = text.split("\n")
    sections: Dict[str, List[str]] = {"general": []}
    current_section = "general"

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if line looks like a section header (short, matches section keywords)
        matched_header = None
        if len(stripped.split()) <= 4:
            for sec_name, patterns in SECTION_HEADERS:
                for p in patterns:
                    if re.search(p, stripped, re.IGNORECASE):
                        matched_header = sec_name
                        break
                if matched_header:
                    break

        if matched_header:
            current_section = matched_header
            if current_section not in sections:
                sections[current_section] = []
        else:
            sections[current_section].append(stripped)

    # Join lines back into text blocks
    return {sec: "\n".join(content_lines) for sec, content_lines in sections.items() if content_lines}


def analyze_resume_issues(
    resume_text: str,
    target_role: str = "Software Engineer",
    analysis_context: Optional[Dict[str, Any]] = None
) -> List[ResumeIssue]:
    """
    Scans the resume sections for concrete actionable issues with real evidence.
    """
    sections = segment_resume_sections(resume_text)
    issues: List[ResumeIssue] = []
    issue_counter = 1

    # 1. Experience Section: Look for weak passive phrasing
    exp_text = sections.get("experience", "") or sections.get("general", "")
    for line in exp_text.split("\n"):
        for pattern in WEAK_PHRASES:
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                snippet = line.strip()
                if len(snippet) > 80:
                    snippet = snippet[:77] + "..."
                issues.append(ResumeIssue(
                    id=f"issue_{issue_counter}",
                    section="Experience",
                    severity="high",
                    category="passive_voice",
                    evidence=snippet,
                    roast="These bullets describe a job. They don't prove you were useful at it.",
                    why_it_matters="Recruiters scan for ownership and initiative rather than a passive list of tasks assigned to you.",
                    suggestion="Replace passive verbs with decisive action verbs showing what you initiated, built, or delivered.",
                    rewrite_example="Spearheaded the design and deployment of the feature, cutting delivery time by 20%."
                ))
                issue_counter += 1
                break
        if len(issues) >= 2:
            break

    # 2. Projects Section: Look for missing metrics
    proj_text = sections.get("projects", "")
    if proj_text:
        has_metric = any(re.search(p, proj_text, re.IGNORECASE) for p in METRIC_PATTERNS)
        if not has_metric:
            sample_bullet = proj_text.split("\n")[0].strip()
            issues.append(ResumeIssue(
                id=f"issue_{issue_counter}",
                section="Projects",
                severity="high",
                category="weak_impact",
                evidence=sample_bullet[:85] if sample_bullet else "Project listing without metrics",
                roast="Your project bullet tells us what you touched, not why anyone should care.",
                why_it_matters="Without numbers, scale, or metrics, technical projects sound like 15-minute tutorial copy-pastes.",
                suggestion="Add the dataset size, latency reduction, user count, or validation accuracy truthfully where available.",
                rewrite_example="Built classification pipeline on 12K records using XGBoost, achieving 91% accuracy and sub-50ms inference."
            ))
            issue_counter += 1

    # 3. Buzzwords / Clichés across Summary or general text
    summary_text = sections.get("summary", "") or resume_text[:350]
    for pattern in CLICHE_BUZZWORDS:
        m = re.search(pattern, summary_text, re.IGNORECASE)
        if m:
            matched_buzzword = m.group(0)
            issues.append(ResumeIssue(
                id=f"issue_{issue_counter}",
                section="Summary",
                severity="medium",
                category="cliché_buzzwords",
                evidence=f"...{matched_buzzword}...",
                roast=f"Putting '{matched_buzzword}' on a resume is like a restaurant advertising that their food is edible.",
                why_it_matters="Overused adjectives carry zero evidentiary weight with technical hiring managers.",
                suggestion="Delete the fluff and replace it with your specific technical stack, years of experience, or domain track record.",
                rewrite_example=f"Software engineer with 2+ years building Python backends, REST APIs, and PostgreSQL database architectures."
            ))
            issue_counter += 1
            break

    # 4. Target Role Skill Gaps (from analysis_context or JOB_ROLES)
    role_info = JOB_ROLES.get(target_role, {})
    required_skills = role_info.get("required", [])

    text_lower = resume_text.lower()
    missing_for_role = [s for s in required_skills if s not in text_lower]

    if missing_for_role:
        top_missing = missing_for_role[:3]
        issues.append(ResumeIssue(
            id=f"issue_{issue_counter}",
            section="Skills",
            severity="high",
            category="missing_skills",
            evidence=f"Target role: {target_role}. Missing: {', '.join(top_missing)}",
            roast=f"Applying for {target_role} without {', '.join(top_missing)} is playing on hard mode with blindfolds on.",
            why_it_matters=f"ATS filters automatically score candidate match based on core required keywords for {target_role}.",
            suggestion=f"If you have academic, project, or course experience with {', '.join(top_missing)}, highlight them explicitly.",
            rewrite_example=f"Skills: {', '.join(s.title() for s in top_missing[:2])}, Git, Linux, REST APIs."
        ))
        issue_counter += 1

    # 5. Check if Projects section is completely absent for technical role
    if not proj_text and target_role in ["Software Engineer", "Machine Learning Engineer", "Frontend Developer", "Backend Developer", "Data Scientist"]:
        issues.append(ResumeIssue(
            id=f"issue_{issue_counter}",
            section="Structure",
            severity="high",
            category="vague_bullets",
            evidence="Projects section is missing or unlabeled",
            roast="No projects section in a software resume is bold. Dangerous, but bold.",
            why_it_matters="For developers and data scientists, real code projects are the #1 proof of competence for recruiters.",
            suggestion="Add a dedicated 'Projects' section featuring 2-3 significant projects with live links or GitHub repos.",
            rewrite_example="Projects: MargDarshak (AI Career Guidance) — Built NLP analysis pipeline in FastAPI & React with 92% extraction precision."
        ))
        issue_counter += 1

    return issues
