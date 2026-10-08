"""
gap_analyzer.py
---------------
PIPELINE STEP 6: Skill Gap Analysis

For each top job role from Step 5, identifies which required and preferred
skills are missing from the resume.

Method: Set subtraction
  missing_required = required_skills - resume_skills
  missing_preferred = preferred_skills - resume_skills

Simple, interpretable, and directly actionable.
The output directly feeds Step 7 (Course Recommendation).
"""

from data.job_roles import JOB_ROLES


def analyze_gaps(matched_skills: list, top_roles: list) -> dict:
    """
    Computes skill gaps for each top job role.

    Args:
        matched_skills: Skills found in the resume (from skill_extractor.py)
        top_roles: List of top role dicts from job_classifier.py

    Returns:
        dict mapping each role to its required and preferred skill gaps
    """
    resume_skills_lower = set(s.lower() for s in matched_skills)
    gaps = {}

    for role_entry in top_roles:
        role_name = role_entry["role"]
        role_data = JOB_ROLES.get(role_name, {})

        required = role_data.get("required", [])
        preferred = role_data.get("preferred", [])

        missing_required = [
            skill for skill in required
            if skill.lower() not in resume_skills_lower
        ]

        missing_preferred = [
            skill for skill in preferred
            if skill.lower() not in resume_skills_lower
        ]

        # Readiness score: what % of required skills are present
        if required:
            readiness = round(
                (len(required) - len(missing_required)) / len(required) * 100, 1
            )
        else:
            readiness = 100.0

        gaps[role_name] = {
            "missing_required": missing_required,
            "missing_preferred": missing_preferred,
            "readiness_score": readiness,
            "match_score": role_entry["score"],
            "priority": "High" if missing_required else "Medium" if missing_preferred else "Ready"
        }

    return {
        "gaps": gaps,
        "method": "Set subtraction: required_skills - resume_skills"
    }
