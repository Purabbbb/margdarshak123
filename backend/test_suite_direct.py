"""
test_suite_direct.py
---------------------
Direct unit and functional test of all MargDarshak modules without unbuffered I/O delays.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from teacher_matching.teacher_matcher import TeacherMatcher
from teacher_matching.teacher_repository import TeacherRepository
from teacher_matching.schemas import TeacherPreferences
from resume_roaster.roast_engine import RoastEngine
from resume_roaster.improvement_engine import ImprovementEngine
from resume_roaster.scoring import score_resume
from resume_roaster.resume_analyzer import segment_resume_sections, analyze_resume_issues

def run_all_tests():
    print("========================================")
    print("1. TEACHER REPOSITORY & FILTER TEST")
    print("========================================")
    repo = TeacherRepository()
    all_teachers = repo.get_all()
    print(f"Total seeded teachers: {len(all_teachers)}")
    assert len(all_teachers) >= 20, "Should have at least 20 seeded teacher profiles"

    online_teachers = repo.filter_teachers(mode="online")
    print(f"Online teachers count: {len(online_teachers)}")
    assert len(online_teachers) > 0

    print("[PASS] Teacher repository tests passed!\n")

    print("========================================")
    print("2. HYBRID TEACHER MATCHER RANKING TEST")
    print("========================================")
    matcher = TeacherMatcher()

    # Case A: Data Analyst with specific gaps
    analysis_da = {
        "job_roles": {"best_match": {"role": "Data Analyst", "score": 85}},
        "skills": {"matched_skills": ["python", "excel", "pandas"]},
        "gaps": {
            "gaps": {
                "Data Analyst": {
                    "missing_required": ["sql", "power bi"],
                    "missing_preferred": ["statistics", "tableau"]
                }
            }
        }
    }

    rec_res_da = matcher.recommend_teachers(analysis_da, target_role="Data Analyst", limit=4)
    print(f"Target Role: {rec_res_da.target_role}")
    print(f"Skill Gaps: {rec_res_da.skill_gaps}")
    print("Top Recommendations:")
    for r in rec_res_da.recommendations:
        print(f"  #{r.rank} {r.teacher.name} | Overall: {r.overall_match}% | Coverage: {r.skill_coverage}% | Matched: {r.matched_skills}")
        assert r.overall_match > 0
        assert r.reason is not None

    # Top recommendation should have high coverage of sql/power bi/statistics/tableau
    top_da = rec_res_da.recommendations[0]
    assert top_da.skill_coverage >= 50.0

    # Case B: Frontend Developer
    analysis_fe = {
        "job_roles": {"best_match": {"role": "Frontend Developer", "score": 75}},
        "skills": {"matched_skills": ["html", "css", "javascript"]},
        "gaps": {
            "gaps": {
                "Frontend Developer": {
                    "missing_required": ["react", "typescript"],
                    "missing_preferred": ["tailwind", "next.js"]
                }
            }
        }
    }
    rec_res_fe = matcher.recommend_teachers(analysis_fe, target_role="Frontend Developer", limit=3)
    print("\nFrontend Developer Recommendations:")
    for r in rec_res_fe.recommendations:
        print(f"  #{r.rank} {r.teacher.name} | Overall: {r.overall_match}% | Coverage: {r.skill_coverage}% | Matched: {r.matched_skills}")
    
    print("[PASS] Teacher matcher tests passed!\n")

    print("========================================")
    print("3. RESUME ROASTER DETERMINISTIC SCORING")
    print("========================================")
    sample_weak_resume = (
        "SUMMARY\n"
        "Hardworking, passionate, results-driven team player with synergy.\n\n"
        "EXPERIENCE\n"
        "- Responsible for working on python scripts.\n"
        "- Helped with database tasks and duties included testing.\n\n"
        "PROJECTS\n"
        "- Built a web application.\n\n"
        "SKILLS\n"
        "Python, HTML, CSS"
    )

    scores_weak = score_resume(sample_weak_resume, target_role="Software Engineer")
    print(f"Weak resume score: {scores_weak.overall_score}/100")
    print(f"  Impact: {scores_weak.impact}, Clarity: {scores_weak.clarity}, Conciseness: {scores_weak.conciseness}")
    assert scores_weak.overall_score < 60, "Weak resume with cliches and passive verbs should score < 60"

    roaster = RoastEngine()
    roast_out = roaster.roast_resume(sample_weak_resume, target_role="Software Engineer", tone="balanced")
    print(f"\nHeadline Roast: {roast_out.headline_roast}")
    print(f"Summary: {roast_out.summary}")
    print(f"Issues detected count: {len(roast_out.issues)}")
    assert len(roast_out.issues) >= 3

    print("[PASS] Resume Roaster tests passed!\n")

    print("========================================")
    print("4. RESUME IMPROVEMENT & RE-SCORING TEST")
    print("========================================")
    improver = ImprovementEngine()
    imp_out = improver.improve_resume(sample_weak_resume, target_role="Software Engineer")
    print(f"Original Score: {imp_out.original_score} -> Improved Score: {imp_out.improved_score} (Delta: +{imp_out.score_delta})")
    print(f"Changes count: {len(imp_out.changes)}")
    assert imp_out.improved_score >= imp_out.original_score
    assert len(imp_out.changes) > 0

    for c in imp_out.changes:
        print(f"\n[{c.section}]")
        print(f"  Before: {c.before}")
        print(f"  After : {c.after}")

    # Verify no fabricated data (no random company names added)
    assert "Google" not in imp_out.revised_resume_text
    assert "PhD" not in imp_out.revised_resume_text

    print("\n[PASS] Resume Improvement tests passed!\n")

    print("========================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (100% OK)")
    print("========================================")

if __name__ == "__main__":
    run_all_tests()
