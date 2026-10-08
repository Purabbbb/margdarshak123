"""
teacher_repository.py
---------------------
Repository pattern abstraction for accessing teacher/mentor data.
Decouples matching algorithms from the physical persistence layer.
Currently sources from backend.data.teachers_db (seeded dataset),
and can be swapped with Supabase/PostgreSQL or an approved mentor API.
"""

from typing import List, Optional

try:
    from backend.data.teachers_db import SEEDED_TEACHERS
    from backend.teacher_matching.schemas import TeacherProfile
except ModuleNotFoundError:
    from data.teachers_db import SEEDED_TEACHERS
    from teacher_matching.schemas import TeacherProfile


class TeacherRepository:
    def __init__(self, data: Optional[List[dict]] = None):
        raw = data if data is not None else SEEDED_TEACHERS
        self._teachers: List[TeacherProfile] = [TeacherProfile(**item) for item in raw]
        self._by_id = {t.id: t for t in self._teachers}

    def get_all(self) -> List[TeacherProfile]:
        """Returns all teachers."""
        return list(self._teachers)

    def get_by_id(self, teacher_id: str) -> Optional[TeacherProfile]:
        """Retrieve a single teacher by ID."""
        return self._by_id.get(teacher_id)

    def filter_teachers(
        self,
        mode: Optional[str] = None,
        language: Optional[str] = None,
        teaching_style: Optional[str] = None,
        max_hourly_rate: Optional[float] = None
    ) -> List[TeacherProfile]:
        """Filter teachers based on student preference criteria."""
        results = []
        for t in self._teachers:
            if mode and mode.lower() != "all":
                if not any(m.lower() == mode.lower() for m in t.mode):
                    continue

            if language and language.lower() != "all":
                if not any(l.lower() == language.lower() for l in t.languages):
                    continue

            if teaching_style and teaching_style.lower() != "all":
                if not any(s.lower() == teaching_style.lower() for s in t.teaching_style):
                    continue

            if max_hourly_rate is not None and t.hourly_rate:
                try:
                    num = float(t.hourly_rate.replace("$", "").replace("/hr", "").strip())
                    if num > max_hourly_rate:
                        continue
                except ValueError:
                    pass

            results.append(t)
        return results
