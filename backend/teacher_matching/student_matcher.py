"""Reverse teacher-to-student matching for the teacher workspace."""

from typing import List

from .schemas import StudentNeed, StudentRecommendation, StudentRecommendResponse
from .teacher_matcher import normalize_skill


DEMO_STUDENTS = [
    StudentNeed(
        id="student_purob",
        name="Purob",
        email="purob.demo@margdarshak.local",
        required_skills=["react"],
        profile="Frontend learner building React applications and preparing for junior developer roles.",
    ),
    StudentNeed(
        id="student_isha",
        name="Isha",
        email="isha.demo@margdarshak.local",
        required_skills=["python", "machine learning"],
        profile="Early-career analyst moving toward applied machine learning.",
    ),
    StudentNeed(
        id="student_rahul",
        name="Rahul",
        email="rahul.demo@margdarshak.local",
        required_skills=["sql", "data analysis"],
        profile="Graduate strengthening SQL and analytics fundamentals.",
    ),
]


def recommend_students(teacher_id: str, teacher_skills: List[str], teacher_expertise: dict, limit: int = 6) -> StudentRecommendResponse:
    normalized_teacher_skills = {
        normalize_skill(skill)
        for skill in teacher_skills[:5]
    }
    recommendations = []

    for student in DEMO_STUDENTS:
        required = [normalize_skill(skill) for skill in student.required_skills]
        matched = [skill for skill in required if skill in normalized_teacher_skills]
        if not matched:
            continue

        coverage = len(matched) / len(required) * 100
        strength_bonus = sum(
            10 if teacher_expertise.get(skill, "").lower() == "high" else 5
            for skill in matched
        )
        score = min(100.0, coverage * 0.9 + strength_bonus)
        evidence = [
            f"Strong {skill.title()} expertise"
            for skill in matched
            if teacher_expertise.get(skill, "").lower() == "high"
        ]
        evidence.append(f"Matches {len(matched)} of {len(required)} required skills")
        recommendations.append(
            StudentRecommendation(
                rank=0,
                student=student,
                match_score=round(score, 1),
                matched_skills=matched,
                evidence=evidence,
            )
        )

    recommendations.sort(key=lambda item: item.match_score, reverse=True)
    for rank, recommendation in enumerate(recommendations[:limit], start=1):
        recommendation.rank = rank

    return StudentRecommendResponse(
        teacher_id=teacher_id,
        recommendations=recommendations[:limit],
    )
