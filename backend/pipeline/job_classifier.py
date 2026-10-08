"""
job_classifier.py
-----------------
PIPELINE STEP 5: Job Role Classification

Determines which job roles best match the resume's skill set.

Method: Cosine Similarity using skill vectors

For each job role:
  1. Build a binary vector: [1 if skill present in required+preferred, 0 if not]
  2. Build the same vector for the resume's extracted skills
  3. Compute cosine similarity between the two vectors
  4. Rank all job roles by similarity score

Why cosine similarity over simple skill counting:
  - Normalizes for roles that have more or fewer required skills
  - A role with 5/5 skills matched scores higher than a role with 6/10
  - Industry-standard approach for skill-based job matching

Returns top 4 matches with % scores and reasoning.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from data.job_roles import JOB_ROLES


def build_skill_universe(job_roles: dict) -> list:
    """
    Creates a unified list of all skills across all job roles.
    This becomes the dimensions of our skill vectors.
    """
    universe = set()
    for role_data in job_roles.values():
        universe.update(role_data["required"])
        universe.update(role_data["preferred"])
    return sorted(list(universe))


# Build the universe once at module load
SKILL_UNIVERSE = build_skill_universe(JOB_ROLES)
UNIVERSE_INDEX = {skill: i for i, skill in enumerate(SKILL_UNIVERSE)}


def vectorize_skills(skill_list: list, universe_index: dict, universe_size: int) -> np.ndarray:
    """
    Converts a list of skills into a binary numpy vector.
    The vector length = number of unique skills in universe.
    1 = skill present, 0 = skill absent.
    """
    vector = np.zeros(universe_size)
    for skill in skill_list:
        skill_lower = skill.lower()
        if skill_lower in universe_index:
            vector[universe_index[skill_lower]] = 1.0
    return vector


def classify_job_roles(matched_skills: list, top_n: int = 4) -> dict:
    """
    Computes cosine similarity between resume skills and each job role's skill set.

    Required skills are weighted 2x over preferred skills to reflect importance.

    Args:
        matched_skills: List of skill strings from skill_extractor.py
        top_n: Number of top job roles to return

    Returns:
        dict with ranked job roles and their similarity scores
    """
    universe_size = len(SKILL_UNIVERSE)

    # Normalize matched skills to lowercase for comparison
    resume_skills_lower = [s.lower() for s in matched_skills]

    # Build resume vector
    resume_vector = vectorize_skills(resume_skills_lower, UNIVERSE_INDEX, universe_size)

    results = []

    for role_name, role_data in JOB_ROLES.items():
        # Build weighted role vector: required=2.0, preferred=1.0
        role_vector = np.zeros(universe_size)
        for skill in role_data["required"]:
            skill_lower = skill.lower()
            if skill_lower in UNIVERSE_INDEX:
                role_vector[UNIVERSE_INDEX[skill_lower]] = 2.0

        for skill in role_data["preferred"]:
            skill_lower = skill.lower()
            if skill_lower in UNIVERSE_INDEX:
                role_vector[UNIVERSE_INDEX[skill_lower]] = 1.0

        # Cosine similarity (handle zero vectors)
        if np.sum(resume_vector) == 0 or np.sum(role_vector) == 0:
            similarity = 0.0
        else:
            similarity = cosine_similarity(
                resume_vector.reshape(1, -1),
                role_vector.reshape(1, -1)
            )[0][0]

        # Count matched required skills
        matched_required = [s for s in role_data["required"] if s.lower() in resume_skills_lower]
        matched_preferred = [s for s in role_data["preferred"] if s.lower() in resume_skills_lower]

        results.append({
            "role": role_name,
            "score": round(float(similarity) * 100, 1),
            "matched_required": matched_required,
            "matched_preferred": matched_preferred,
            "total_required": len(role_data["required"]),
            "description": role_data["description"],
            "onet_code": role_data.get("onet_code", "")
        })

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)

    top_results = results[:top_n]

    return {
        "top_roles": top_results,
        "best_match": top_results[0] if top_results else None,
        "method": "Cosine similarity on weighted binary skill vectors",
        "skill_universe_size": universe_size
    }
