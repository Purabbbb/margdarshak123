"""
course_recommender.py
---------------------
PIPELINE STEP 7: Course Recommendation

Maps missing skills (from Step 6) to curated learning resources.

Strategy:
  1. For each missing required/preferred skill across top job roles
  2. Look up the skill in the courses database
  3. If not found, generate a Coursera search URL as fallback
  4. Deduplicate across roles (same missing skill across multiple roles recommended once)
  5. Prioritize by: required > preferred, higher role match score first
"""

from data.courses_db import COURSES_DB, DEFAULT_COURSE
from urllib.parse import quote


def recommend_courses(gaps: dict) -> dict:
    """
    Generates course recommendations from skill gaps.

    Args:
        gaps: Output from gap_analyzer.py — dict of role -> gap info

    Returns:
        dict with:
          - by_role: recommendations organized by job role
          - all_unique: deduplicated list of all recommended courses
          - priority_skills: most critical skills to learn first
    """
    seen_skills = set()
    by_role = {}
    priority_skills = []

    # Process roles in order (already ranked by match score)
    for role_name, gap_info in gaps.items():
        role_courses = {
            "required_courses": [],
            "preferred_courses": []
        }

        # Required skill gaps get highest priority
        for skill in gap_info.get("missing_required", []):
            courses = _get_courses_for_skill(skill)
            role_courses["required_courses"].append({
                "skill": skill,
                "courses": courses,
                "priority": "Required"
            })
            if skill not in seen_skills:
                priority_skills.append(skill)
                seen_skills.add(skill)

        # Preferred skill gaps
        for skill in gap_info.get("missing_preferred", []):
            courses = _get_courses_for_skill(skill)
            role_courses["preferred_courses"].append({
                "skill": skill,
                "courses": courses,
                "priority": "Preferred"
            })

        by_role[role_name] = role_courses

    return {
        "by_role": by_role,
        "priority_skills": priority_skills[:10],  # Top 10 most critical
        "total_unique_skills_to_learn": len(seen_skills)
    }


def _get_courses_for_skill(skill: str) -> list:
    """
    Looks up courses for a skill. Falls back to Coursera search URL if not in DB.
    Case-insensitive lookup.
    """
    skill_lower = skill.lower()

    # Direct lookup
    if skill_lower in COURSES_DB:
        return COURSES_DB[skill_lower]

    # Partial match — check if skill is a substring of a DB key or vice versa
    for db_key in COURSES_DB:
        if db_key in skill_lower or skill_lower in db_key:
            return COURSES_DB[db_key]

    # Fallback: generate Coursera search URL
    fallback = DEFAULT_COURSE.copy()
    fallback["title"] = f"Search '{skill}' courses"
    fallback["url"] = f"https://www.coursera.org/search?query={quote(skill)}"
    return [fallback]
