"""
job_matcher.py
--------------
PIPELINE STEP 8: Real-Time Job Matching

Fetches up to 50 live job postings from Adzuna sorted by relevance (default).
Client-side date sort in the UI re-orders by the 'created' field.

Keeping sort_by off (relevance default) means the two sort options
in the UI produce visibly different orderings.
"""

import os
import requests
from typing import Optional

ADZUNA_APP_ID   = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY  = os.getenv("ADZUNA_APP_KEY", "")
ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"


def fetch_jobs(
    job_title: str,
    location: Optional[str] = None,
    results_per_page: int = 50
) -> dict:
    """
    Fetches job listings from Adzuna sorted by relevance.
    The frontend handles date sorting client-side.
    """
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return _mock_jobs(job_title, location)

    params = {
        "app_id":           ADZUNA_APP_ID,
        "app_key":          ADZUNA_APP_KEY,
        "results_per_page": min(int(results_per_page), 50),
        "what":             job_title,
        "content-type":     "application/json"
        # No sort_by param — defaults to Adzuna relevance ranking
    }

    if location:
        params["where"] = location

    try:
        response = requests.get(ADZUNA_BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        jobs = []
        for job in data.get("results", []):
            contract = job.get("contract_type", "")
            contract_label = ""
            if contract == "permanent":
                contract_label = "Full-time"
            elif contract in ("contract", "part_time"):
                contract_label = "Contract / Internship"
            if "intern" in job.get("title", "").lower():
                contract_label = "Internship"

            jobs.append({
                "title":       job.get("title", "").strip(),
                "company":     job.get("company", {}).get("display_name", "N/A"),
                "location":    job.get("location", {}).get("display_name", location or "India"),
                "salary":      _format_salary(job.get("salary_min"), job.get("salary_max")),
                "description": (job.get("description", "")[:220] + "...") if job.get("description") else "",
                "url":         job.get("redirect_url", ""),
                "created":     job.get("created", "")[:10],
                "contract":    contract_label,
                "source":      "Adzuna"
            })

        return {
            "jobs":        jobs,
            "total_found": data.get("count", len(jobs)),
            "query": {
                "role":     job_title,
                "location": location or "India"
            },
            "status": "success"
        }

    except requests.exceptions.ConnectionError:
        return {"jobs": [], "status": "error", "message": "Connection failed."}
    except requests.exceptions.HTTPError as e:
        return {"jobs": [], "status": "error", "message": f"API error: {str(e)}"}
    except Exception as e:
        return {"jobs": [], "status": "error", "message": str(e)}


def _format_salary(mn, mx) -> str:
    if not mn and not mx: return "Not disclosed"
    if mn and mx: return f"₹{int(mn):,} – ₹{int(mx):,}"
    if mn: return f"₹{int(mn):,}+"
    return f"Up to ₹{int(mx):,}"


def _mock_jobs(job_title, location):
    return {
        "jobs": [{
            "title":       job_title,
            "company":     "Add Adzuna API keys to see real listings",
            "location":    location or "India",
            "salary":      "Competitive",
            "description": "Configure ADZUNA_APP_ID and ADZUNA_APP_KEY in your .env file.",
            "url":         f"https://www.linkedin.com/jobs/search/?keywords={job_title.replace(' ', '%20')}",
            "created":     "Today",
            "contract":    "",
            "source":      "Mock"
        }],
        "total_found": 1,
        "query":  {"role": job_title, "location": location or "India"},
        "status": "mock"
    }
