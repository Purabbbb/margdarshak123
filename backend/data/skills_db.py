"""
skills_db.py
------------
Master skills database used in Step 4 (Skill Extraction).
Organized by domain for clarity and maintainability.
The skill extractor maps resume tokens against this list.
"""

SKILLS_DB = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c", "c++", "c#", "r", "go",
        "rust", "kotlin", "swift", "scala", "perl", "ruby", "php", "matlab", "julia",
        "dart", "elixir", "haskell", "lua", "shell", "bash", "powershell", "groovy",
        "objective-c", "assembly", "cobol", "fortran", "vba", "sas"
    ],

    "web_frontend": [
        "html", "css", "react", "angular", "vue", "svelte", "next.js", "nuxt.js",
        "gatsby", "redux", "tailwind", "bootstrap", "sass", "less", "webpack",
        "vite", "jquery", "typescript", "graphql", "rest api", "ajax", "figma",
        "adobe xd", "sketch", "responsive design", "web accessibility", "pwa",
        "three.js", "d3.js", "material ui", "ant design", "chakra ui"
    ],

    "web_backend": [
        "node.js", "express", "fastapi", "django", "flask", "spring", "spring boot",
        "laravel", "rails", "asp.net", "fastify", "nestjs", "strapi", "graphql",
        "rest", "soap", "microservices", "websocket", "grpc", "nginx", "apache",
        "oauth", "jwt", "api design", "swagger", "postman"
    ],

    "databases": [
        "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra",
        "elasticsearch", "firebase", "dynamodb", "oracle", "ms sql server",
        "mariadb", "neo4j", "influxdb", "couchdb", "supabase", "prisma",
        "hibernate", "sequelize", "nosql", "database design", "query optimization",
        "stored procedures", "indexing", "data modeling"
    ],

    "data_science_ml": [
        "machine learning", "deep learning", "neural networks", "nlp",
        "natural language processing", "computer vision", "reinforcement learning",
        "supervised learning", "unsupervised learning", "regression", "classification",
        "clustering", "random forest", "xgboost", "gradient boosting", "svm",
        "naive bayes", "decision tree", "k-means", "pca", "feature engineering",
        "model evaluation", "cross validation", "hyperparameter tuning",
        "transfer learning", "bert", "transformers", "llm", "generative ai",
        "time series", "anomaly detection", "recommendation systems"
    ],

    "data_tools": [
        "pandas", "numpy", "scipy", "scikit-learn", "tensorflow", "keras",
        "pytorch", "hugging face", "spacy", "nltk", "opencv", "matplotlib",
        "seaborn", "plotly", "bokeh", "tableau", "power bi", "looker",
        "qlik", "excel", "google sheets", "jupyter", "google colab",
        "apache spark", "hadoop", "hive", "kafka", "airflow", "dbt",
        "mlflow", "weights and biases", "data cleaning", "etl", "data pipeline"
    ],

    "cloud_devops": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes",
        "terraform", "ansible", "jenkins", "github actions", "gitlab ci",
        "circleci", "travis ci", "helm", "prometheus", "grafana", "elk stack",
        "linux", "unix", "networking", "load balancing", "cdn", "s3",
        "ec2", "lambda", "cloud functions", "serverless", "iaas", "paas", "saas",
        "ci/cd", "devops", "sre", "monitoring", "logging", "infrastructure"
    ],

    "cybersecurity": [
        "penetration testing", "ethical hacking", "network security",
        "application security", "cryptography", "firewalls", "intrusion detection",
        "siem", "vulnerability assessment", "owasp", "burp suite", "metasploit",
        "wireshark", "nmap", "kali linux", "malware analysis", "incident response",
        "soc", "threat intelligence", "zero trust", "ssl", "tls", "vpn",
        "identity management", "iam", "compliance", "gdpr", "iso 27001"
    ],

    "mobile": [
        "android", "ios", "react native", "flutter", "xamarin", "ionic",
        "swift", "kotlin", "objective-c", "xcode", "android studio",
        "firebase", "push notifications", "app store", "play store",
        "mobile ui", "mobile testing", "ux design", "responsive"
    ],

    "data_analysis": [
        "data analysis", "data visualization", "statistics", "probability",
        "hypothesis testing", "a/b testing", "sql", "excel", "power bi",
        "tableau", "google analytics", "mixpanel", "business intelligence",
        "kpi", "dashboards", "reporting", "data storytelling", "descriptive statistics",
        "inferential statistics", "forecasting", "cohort analysis", "funnel analysis"
    ],

    "project_management": [
        "agile", "scrum", "kanban", "waterfall", "jira", "confluence",
        "trello", "asana", "monday", "notion", "project planning",
        "risk management", "stakeholder management", "sprint planning",
        "product roadmap", "release management", "change management",
        "pmp", "prince2", "lean", "six sigma", "okr"
    ],

    "design": [
        "ui design", "ux design", "user research", "wireframing", "prototyping",
        "figma", "adobe xd", "sketch", "invision", "adobe photoshop",
        "adobe illustrator", "adobe after effects", "canva", "typography",
        "color theory", "design systems", "accessibility", "usability testing",
        "information architecture", "interaction design", "visual design",
        "brand identity", "motion design", "3d modeling", "blender"
    ],

    "business_finance": [
        "financial modeling", "valuation", "accounting", "budgeting",
        "forecasting", "excel", "financial analysis", "investment analysis",
        "equity research", "derivatives", "portfolio management",
        "risk analysis", "balance sheet", "p&l", "cash flow", "dcf",
        "mergers and acquisitions", "ipo", "venture capital", "private equity",
        "crm", "salesforce", "hubspot", "marketing analytics", "seo", "sem"
    ],

    "soft_skills": [
        "communication", "leadership", "teamwork", "problem solving",
        "critical thinking", "time management", "adaptability", "creativity",
        "collaboration", "presentation", "negotiation", "mentoring",
        "public speaking", "technical writing", "documentation"
    ],

    "other_tools": [
        "git", "github", "gitlab", "bitbucket", "vs code", "intellij",
        "eclipse", "vim", "linux", "windows server", "macos",
        "microsoft office", "latex", "markdown", "api testing",
        "unit testing", "integration testing", "tdd", "bdd", "selenium",
        "cypress", "jest", "pytest", "junit", "load testing", "jmeter"
    ]
}

# Flat list of all skills for fast lookup
ALL_SKILLS = []
for category, skills in SKILLS_DB.items():
    ALL_SKILLS.extend(skills)

# Deduplicated
ALL_SKILLS = list(set(ALL_SKILLS))
