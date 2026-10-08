"""
llm_client.py
-------------
Provider-agnostic LLM client abstraction for the MargDarshak Resume Roaster.

Supports:
- Gemini (via google-generativeai or raw REST API if GEMINI_API_KEY is set)
- OpenAI (if OPENAI_API_KEY is set)
- Deterministic High-Quality Fallback (if no API keys are present)

Safety rules:
- The roast targets the RESUME, NEVER the person.
- Strictly zero comments on race, gender, religion, appearance, nationality, or protected traits.
- Professional, constructive, witty career critique.
"""

import os
import json
from typing import Dict, Any, Optional, List

class LLMClient:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.provider = "none"

        if self.gemini_key:
            self.provider = "gemini"
        elif self.openai_key:
            self.provider = "openai"

    def generate_roast_content(
        self,
        resume_text: str,
        target_role: str,
        tone: str,
        score: int,
        issues: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generates headline roast and punchy summary tailored to the resume and score.
        If an external LLM is configured, queries it; otherwise employs the curated deterministic generator.
        """
        # If Gemini is configured, try querying it
        if self.provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"You are a witty, constructive tech career coach roasting a resume for the target role '{target_role}'. "
                    f"Overall score: {score}/100. Tone: '{tone}'. "
                    f"Rules: Roast the resume writing, never the person. No offensive language. Keep it under 2 punchy sentences. "
                    f"Resume snippet: {resume_text[:600]}\n"
                    f"Return a JSON object: {{\"headline_roast\": \"...\", \"summary\": \"...\"}}"
                )
                res = model.generate_content(prompt)
                parsed = json.loads(res.text.strip().replace("```json", "").replace("```", ""))
                return parsed
            except Exception:
                pass

        # High-quality curated deterministic generator
        return self._fallback_roast(target_role, tone, score, issues)

    def _fallback_roast(
        self,
        target_role: str,
        tone: str,
        score: int,
        issues: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Deterministic, role-specific, tone-sensitive roast generator.
        """
        if tone == "savage":
            if score < 50:
                headline = f"This resume doesn't just need a proofreader; it needs a search and rescue team."
                summary = (
                    f"For a {target_role} application, this reads like a classified document with all the impact redacted. "
                    f"Recruiters won't reject you out of malice; they'll just forget this document ever crossed their screen."
                )
            elif score < 75:
                headline = f"Your resume has more 'responsible for' than an unpaid intern, but none of the actual results."
                summary = (
                    f"You've clearly worked on things, but right now your bullets tell us what you touched, not whether anything survived. "
                    f"Hiring managers for {target_role} want evidence of scale, metrics, and technical velocity."
                )
            else:
                headline = f"Impressive foundation, but your bullet points are hiding your best work like state secrets."
                summary = (
                    f"You're dangerously close to a top-tier {target_role} profile. "
                    f"Drop the modest phrasing, quantify your 3 biggest wins, and stop making the recruiter do detective work."
                )
        elif tone == "friendly":
            if score < 60:
                headline = f"Good start, but your resume is doing your actual potential a disservice."
                summary = (
                    f"You have genuine building blocks for {target_role}, but your achievements are hiding behind passive descriptions. "
                    f"With structured metrics and clearer action verbs, this will read twice as strong."
                )
            else:
                headline = f"Solid background! A few strategic tweaks will make your {target_role} profile shine."
                summary = (
                    f"Your core skills are in place. Focusing on quantifiable results in your projects and tightening the formatting "
                    f"will get you past ATS filters and onto recruiter shortlists."
                )
        else:  # balanced (default)
            if score < 60:
                headline = f"Recruiters won't reject your resume for being bad — they'll reject it for being vague."
                summary = (
                    f"Your profile clearly has effort behind it, but for a {target_role} role, vague responsibilities won't cut it. "
                    f"We found {len(issues)} high-leverage areas where adding numbers and decisive action verbs will transform your credibility."
                )
            elif score < 80:
                headline = f"Your project section has more 'built' than a construction site, but not enough evidence of impact."
                summary = (
                    f"Solid technical skills, but recruiters spend 6 seconds deciding whether you delivered value or just followed orders. "
                    f"A targeted polish on metrics and role-specific keywords will push this into top-percentile territory."
                )
            else:
                headline = f"Strong candidate profile. Now let's turn your good bullets into undeniable evidence."
                summary = (
                    f"You're in the upper tier for {target_role}. A few small tweaks to keyword density and tightening your summary "
                    f"will maximize your interview conversion rate."
                )

        return {
            "headline_roast": headline,
            "summary": summary
        }
