"""
job_roles.py
------------
Maps job roles to their required skill sets.
Used in Step 5 (Job Role Classification) and Step 6 (Skill Gap Analysis).

Skill requirements are aligned with O*NET Online (onetonline.org),
the U.S. Department of Labor's occupational information database,
and ESCO (European Skills/Competences, Qualifications and Occupations) framework.

Each role has:
  - required: core skills (must-have, weighted 2x in cosine similarity)
  - preferred: nice-to-have skills (weighted 1x)
  - description: role summary based on O*NET occupation descriptions
  - onet_code: O*NET-SOC occupation code for reference
"""

JOB_ROLES = {
    "Data Scientist": {
        "onet_code": "15-2051.00",
        "required": [
            "python", "machine learning", "statistics", "pandas", "numpy",
            "scikit-learn", "sql", "data analysis", "feature engineering",
            "model evaluation"
        ],
        "preferred": [
            "deep learning", "tensorflow", "pytorch", "nlp", "spark",
            "tableau", "power bi", "mlflow", "docker", "git", "r"
        ],
        "description": "Develops and applies mathematical, statistical, and computer science methods to analyze large datasets and build predictive models.",
    },

    "Data Analyst": {
        "onet_code": "15-2041.00",
        "required": [
            "sql", "excel", "data analysis", "data visualization", "statistics",
            "reporting", "dashboards"
        ],
        "preferred": [
            "python", "tableau", "power bi", "google analytics", "r",
            "a/b testing", "business intelligence", "kpi"
        ],
        "description": "Collects, processes, and performs statistical analyses on large datasets to help organizations make data-driven decisions.",
    },

    "Machine Learning Engineer": {
        "onet_code": "15-1299.09",
        "required": [
            "python", "machine learning", "deep learning", "tensorflow",
            "pytorch", "scikit-learn", "docker", "git", "rest api"
        ],
        "preferred": [
            "kubernetes", "mlflow", "aws", "spark", "c++",
            "ci/cd", "feature engineering", "linux"
        ],
        "description": "Designs, builds, and deploys machine learning systems and infrastructure at production scale.",
    },

    "Frontend Developer": {
        "onet_code": "15-1254.00",
        "required": [
            "html", "css", "javascript", "react", "git", "responsive design"
        ],
        "preferred": [
            "typescript", "next.js", "tailwind", "redux", "webpack",
            "figma", "web accessibility", "graphql"
        ],
        "description": "Develops and implements the visual and interactive elements of web applications that users interact with directly.",
    },

    "Backend Developer": {
        "onet_code": "15-1252.00",
        "required": [
            "python", "node.js", "sql", "rest api", "git", "databases"
        ],
        "preferred": [
            "docker", "aws", "microservices", "redis", "mongodb",
            "kubernetes", "ci/cd", "linux"
        ],
        "description": "Builds and maintains the server-side logic, databases, and APIs that power web applications.",
    },

    "Full Stack Developer": {
        "onet_code": "15-1256.00",
        "required": [
            "html", "css", "javascript", "react", "node.js", "sql",
            "git", "rest api"
        ],
        "preferred": [
            "typescript", "docker", "aws", "mongodb", "redux",
            "next.js", "postgresql", "ci/cd"
        ],
        "description": "Handles both client-side and server-side development, building complete web applications end-to-end.",
    },

    "DevOps Engineer": {
        "onet_code": "15-1244.00",
        "required": [
            "linux", "docker", "kubernetes", "ci/cd", "git",
            "aws", "terraform", "shell"
        ],
        "preferred": [
            "ansible", "jenkins", "prometheus", "grafana",
            "python", "networking", "helm", "azure"
        ],
        "description": "Manages and automates the infrastructure, deployment pipelines, and operations of software systems.",
    },

    "Cybersecurity Analyst": {
        "onet_code": "15-1212.00",
        "required": [
            "network security", "penetration testing", "linux",
            "vulnerability assessment", "firewalls", "siem"
        ],
        "preferred": [
            "python", "ethical hacking", "owasp", "kali linux",
            "wireshark", "cryptography", "incident response", "compliance"
        ],
        "description": "Plans, implements, and monitors security measures to protect computer networks and systems from unauthorized access or attack.",
    },

    "Mobile App Developer": {
        "onet_code": "15-1254.00",
        "required": [
            "android", "ios", "react native", "flutter", "git"
        ],
        "preferred": [
            "firebase", "kotlin", "swift", "redux", "rest api",
            "ui design", "push notifications"
        ],
        "description": "Designs and builds applications for mobile operating systems including Android and iOS.",
    },

    "UI/UX Designer": {
        "onet_code": "27-1021.00",
        "required": [
            "figma", "wireframing", "prototyping", "ui design",
            "ux design", "user research"
        ],
        "preferred": [
            "adobe xd", "sketch", "design systems", "usability testing",
            "interaction design", "html", "css", "typography"
        ],
        "description": "Researches user needs and designs intuitive, accessible, and visually consistent digital interfaces.",
    },

    "Business Analyst": {
        "onet_code": "13-1111.00",
        "required": [
            "business intelligence", "sql", "excel", "reporting",
            "stakeholder management", "documentation"
        ],
        "preferred": [
            "tableau", "power bi", "agile", "jira", "data analysis",
            "project management", "crm", "financial modeling"
        ],
        "description": "Analyzes business processes and systems to identify opportunities for improvement and translate needs into technical requirements.",
    },

    "Cloud Architect": {
        "onet_code": "15-1299.08",
        "required": [
            "aws", "azure", "gcp", "docker", "kubernetes",
            "networking", "security", "terraform"
        ],
        "preferred": [
            "microservices", "serverless", "ci/cd", "linux",
            "python", "compliance", "infrastructure"
        ],
        "description": "Designs and oversees the implementation of cloud computing strategies and infrastructure for organizations.",
    }
}
