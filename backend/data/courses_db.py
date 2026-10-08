"""
courses_db.py
-------------
Maps individual skills to curated free or low-cost courses.
Used in Step 7 (Course Recommendation).

Sources prioritized: Coursera (free audit), freeCodeCamp, YouTube, official docs.
"""

COURSES_DB = {
    "python": [
        {"title": "Python for Everybody", "platform": "Coursera", "url": "https://www.coursera.org/specializations/python", "free": True},
        {"title": "Python Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=rfscVS0vtbw", "free": True},
    ],
    "machine learning": [
        {"title": "Machine Learning Specialization", "platform": "Coursera (Andrew Ng)", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "free": True},
        {"title": "ML Crash Course", "platform": "Google", "url": "https://developers.google.com/machine-learning/crash-course", "free": True},
    ],
    "deep learning": [
        {"title": "Deep Learning Specialization", "platform": "Coursera (Andrew Ng)", "url": "https://www.coursera.org/specializations/deep-learning", "free": True},
        {"title": "Practical Deep Learning", "platform": "fast.ai", "url": "https://course.fast.ai/", "free": True},
    ],
    "nlp": [
        {"title": "NLP Specialization", "platform": "Coursera (DeepLearning.AI)", "url": "https://www.coursera.org/specializations/natural-language-processing", "free": True},
        {"title": "Hugging Face NLP Course", "platform": "Hugging Face", "url": "https://huggingface.co/learn/nlp-course", "free": True},
    ],
    "sql": [
        {"title": "SQL for Data Science", "platform": "Coursera", "url": "https://www.coursera.org/learn/sql-for-data-science", "free": True},
        {"title": "SQLZoo Interactive Tutorial", "platform": "SQLZoo", "url": "https://sqlzoo.net/", "free": True},
    ],
    "tensorflow": [
        {"title": "TensorFlow Developer Certificate", "platform": "Coursera", "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice", "free": True},
        {"title": "TensorFlow Tutorials", "platform": "TensorFlow Official", "url": "https://www.tensorflow.org/tutorials", "free": True},
    ],
    "pytorch": [
        {"title": "PyTorch Official Tutorials", "platform": "PyTorch", "url": "https://pytorch.org/tutorials/", "free": True},
        {"title": "PyTorch for Deep Learning", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=V_xro1bcAuA", "free": True},
    ],
    "react": [
        {"title": "React Official Docs (Learn)", "platform": "React", "url": "https://react.dev/learn", "free": True},
        {"title": "Full React Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "free": True},
    ],
    "javascript": [
        {"title": "JavaScript Algorithms and Data Structures", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "free": True},
        {"title": "The Odin Project JS Path", "platform": "The Odin Project", "url": "https://www.theodinproject.com/paths/full-stack-javascript", "free": True},
    ],
    "typescript": [
        {"title": "TypeScript Handbook", "platform": "TypeScript Official", "url": "https://www.typescriptlang.org/docs/", "free": True},
        {"title": "TypeScript Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=30LWjhZzg50", "free": True},
    ],
    "docker": [
        {"title": "Docker Getting Started", "platform": "Docker Official", "url": "https://docs.docker.com/get-started/", "free": True},
        {"title": "Docker & Kubernetes Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=Wf2eSG3owoA", "free": True},
    ],
    "kubernetes": [
        {"title": "Kubernetes Basics", "platform": "Kubernetes Official", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "free": True},
        {"title": "Kubernetes Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=X48VuDVv0do", "free": True},
    ],
    "aws": [
        {"title": "AWS Cloud Practitioner Essentials", "platform": "AWS Training", "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", "free": True},
        {"title": "AWS Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=ulprqHHWlng", "free": True},
    ],
    "git": [
        {"title": "Git & GitHub Crash Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk", "free": True},
        {"title": "Pro Git Book", "platform": "git-scm.com", "url": "https://git-scm.com/book/en/v2", "free": True},
    ],
    "tableau": [
        {"title": "Tableau Training Videos", "platform": "Tableau Official", "url": "https://www.tableau.com/learn/training", "free": True},
        {"title": "Tableau for Beginners", "platform": "Simplilearn (YouTube)", "url": "https://www.youtube.com/watch?v=TPMlZxRRaBQ", "free": True},
    ],
    "power bi": [
        {"title": "Power BI Learning Path", "platform": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "free": True},
        {"title": "Power BI Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=NNSHu0rkew8", "free": True},
    ],
    "data analysis": [
        {"title": "Google Data Analytics Certificate", "platform": "Coursera", "url": "https://www.coursera.org/professional-certificates/google-data-analytics", "free": True},
        {"title": "Data Analysis with Python", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "free": True},
    ],
    "statistics": [
        {"title": "Statistics with Python", "platform": "Coursera (U of Michigan)", "url": "https://www.coursera.org/specializations/statistics-with-python", "free": True},
        {"title": "Khan Academy Statistics", "platform": "Khan Academy", "url": "https://www.khanacademy.org/math/statistics-probability", "free": True},
    ],
    "linux": [
        {"title": "Linux Command Line Basics", "platform": "Udacity", "url": "https://www.udacity.com/course/linux-command-line-basics--ud595", "free": True},
        {"title": "Linux Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=sWbUDq4S6Y8", "free": True},
    ],
    "figma": [
        {"title": "Figma Tutorial for Beginners", "platform": "Figma Official (YouTube)", "url": "https://www.youtube.com/watch?v=FTFaQWZBqQ8", "free": True},
        {"title": "Figma UI Design Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=4W4LvJnNegA", "free": True},
    ],
    "network security": [
        {"title": "Google Cybersecurity Certificate", "platform": "Coursera", "url": "https://www.coursera.org/professional-certificates/google-cybersecurity", "free": True},
        {"title": "Cybersecurity Fundamentals", "platform": "IBM SkillsBuild", "url": "https://skillsbuild.org/", "free": True},
    ],
    "node.js": [
        {"title": "Node.js Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=Oe421EPjeBE", "free": True},
        {"title": "Node.js Official Docs", "platform": "Node.js", "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", "free": True},
    ],
    "pandas": [
        {"title": "Pandas Documentation Tutorials", "platform": "Pandas Official", "url": "https://pandas.pydata.org/docs/getting_started/tutorials.html", "free": True},
        {"title": "Pandas Full Course", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=vmEHCJofslg", "free": True},
    ],
    "scikit-learn": [
        {"title": "Scikit-learn Tutorials", "platform": "Scikit-learn Official", "url": "https://scikit-learn.org/stable/tutorial/", "free": True},
        {"title": "ML with Scikit-learn", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=0B5eIE_1vpU", "free": True},
    ],
    "flutter": [
        {"title": "Flutter Official Docs", "platform": "Flutter", "url": "https://docs.flutter.dev/get-started/codelab", "free": True},
        {"title": "Flutter Course for Beginners", "platform": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=VPvVD8t02U8", "free": True},
    ],
    "agile": [
        {"title": "Agile with Atlassian Jira", "platform": "Coursera", "url": "https://www.coursera.org/learn/agile-atlassian-jira", "free": True},
        {"title": "Agile Fundamentals", "platform": "LinkedIn Learning", "url": "https://www.linkedin.com/learning/agile-foundations", "free": False},
    ],
}

# Default fallback for skills not in the DB
DEFAULT_COURSE = {
    "title": "Search on Coursera",
    "platform": "Coursera",
    "url": "https://www.coursera.org/search?query={}",
    "free": True
}
