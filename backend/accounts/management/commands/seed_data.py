from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from accounts.models import StudentProfile, MentorProfile
from careers.models import (
    Skill, CareerRole, RequiredSkill, StudentSkill,
    ProjectRecommendation
)
from careers.services import perform_skill_gap_analysis, generate_or_update_roadmap
from assessments.models import Assessment, Question
from jobs.models import JobOpportunity
from mentorship.models import MentorshipRelationship, MentoringSession, MentorFeedback
from analytics.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial demonstration data for SkillBridge platform'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing SkillBridge database seed..."))

        # 1. Create Skills
        skills_data = [
            ("Python", "LANGUAGE", "General purpose high-level programming language widely used in backend, AI, and data."),
            ("JavaScript", "LANGUAGE", "The core scripting language of the interactive web and modern browser applications."),
            ("TypeScript", "LANGUAGE", "Typed superset of JavaScript providing compile-time type safety."),
            ("SQL", "LANGUAGE", "Standard declarative language for querying and managing relational databases."),
            ("HTML5", "LANGUAGE", "Semantic markup foundation of modern accessible web applications."),
            ("CSS3", "LANGUAGE", "Styling language for responsive layouts, animations, and fluid interfaces."),
            ("Java", "LANGUAGE", "Object-oriented, class-based language used widely in enterprise scale systems."),
            ("C++", "LANGUAGE", "High-performance systems programming language with low-level memory control."),
            
            ("React.js", "FRAMEWORK", "Declarative component-based UI library for modern frontend applications."),
            ("Tailwind CSS", "FRAMEWORK", "Utility-first CSS framework for rapid responsive interface engineering."),
            ("Django", "FRAMEWORK", "High-level Python web framework encouraging clean, pragmatic design."),
            ("RESTful APIs", "FRAMEWORK", "Architectural style for distributed hypermedia systems and microservices."),
            ("Node.js", "FRAMEWORK", "JavaScript runtime built on Chrome's V8 engine for server-side execution."),
            ("Express.js", "FRAMEWORK", "Fast, unopinionated, minimalist web framework for Node.js."),
            ("Next.js", "FRAMEWORK", "React framework with server-side rendering, routing, and static generation."),
            
            ("PostgreSQL", "DATABASE", "Powerful, open source object-relational database system."),
            ("MongoDB", "DATABASE", "Document-oriented NoSQL database designed for flexible JSON-like documents."),
            ("Redis", "DATABASE", "In-memory data structure store used as a database, cache, and message broker."),
            
            ("Docker", "CLOUD_DEVOPS", "Platform for building, shipping, and running applications in isolated containers."),
            ("Kubernetes", "CLOUD_DEVOPS", "Automated container orchestration system for scaling and managing deployments."),
            ("AWS", "CLOUD_DEVOPS", "Amazon Web Services comprehensive cloud computing suite (EC2, S3, IAM, Lambda)."),
            ("Google Cloud Platform", "CLOUD_DEVOPS", "Google's suite of modular cloud infrastructure and AI services."),
            ("CI/CD", "CLOUD_DEVOPS", "Continuous integration and continuous deployment automation pipelines."),
            ("Linux", "CLOUD_DEVOPS", "Unix-like open-source operating system standard for production servers."),
            ("Git", "TOOLS", "Distributed version control system for tracking source code changes."),
            
            ("Machine Learning", "DATA_AI", "Algorithms and statistical models that learn patterns from training data."),
            ("Deep Learning", "DATA_AI", "Neural network architectures (CNNs, RNNs, Transformers) for complex pattern recognition."),
            ("Pandas", "DATA_AI", "Data analysis and manipulation library providing fast DataFrame structures."),
            ("NumPy", "DATA_AI", "Fundamental package for scientific computing with multi-dimensional arrays in Python."),
            ("Scikit-learn", "DATA_AI", "Simple and efficient tools for predictive data modeling and classification."),
            ("PyTorch", "DATA_AI", "Deep learning framework facilitating dynamic computation graphs and research."),
            ("Data Analysis", "DATA_AI", "Inspecting, cleansing, transforming, and modeling data to discover insights."),
            
            ("Network Security", "CYBERSECURITY", "Policies and practices to prevent and monitor unauthorized network access."),
            ("Penetration Testing", "CYBERSECURITY", "Simulated cyber attacks against a computer system to check for exploitable vulnerabilities."),
            ("OWASP", "CYBERSECURITY", "Standard awareness document representing broad consensus on critical web security risks."),
            ("Wireshark", "CYBERSECURITY", "Packet analyzer used for network troubleshooting, analysis, and protocol education."),
        ]

        skill_objs = {}
        for name, category, desc in skills_data:
            skill, _ = Skill.objects.get_or_create(
                name=name,
                defaults={'category': category, 'description': desc}
            )
            skill_objs[name] = skill

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(skill_objs)} skills."))

        # 2. Create Career Roles & Required Skills
        career_roles_data = [
            {
                "title": "Full Stack Developer",
                "slug": "full-stack-developer",
                "description": "Architects, engineers, and maintains both client-facing responsive interfaces and resilient backend API microservices.",
                "overview": "Full Stack Developers are versatile engineers bridging frontend user experiences with performant backend servers and database storage. In 2026, proficiency in React, TypeScript, Python/Node, and cloud-native deployments is strongly sought after.",
                "icon": "Layers",
                "demand_level": "Extremely High Demand",
                "salary": "$85,000 - $135,000 / yr",
                "requirements": [
                    ("JavaScript", 5, True, "Essential language for frontend logic"),
                    ("React.js", 5, True, "Primary UI component framework"),
                    ("HTML5", 4, True, "Accessible semantic document structure"),
                    ("CSS3", 4, True, "Modern responsive styling and layout systems"),
                    ("Tailwind CSS", 3, False, "Accelerated UI styling workflow"),
                    ("Python", 4, True, "Backend application development"),
                    ("Django", 4, True, "Robust backend framework and ORM"),
                    ("RESTful APIs", 5, True, "Client-server communication protocols"),
                    ("PostgreSQL", 4, True, "Relational data modeling and queries"),
                    ("Git", 4, True, "Team collaboration and version control"),
                    ("Docker", 3, False, "Application containerization"),
                ]
            },
            {
                "title": "Python Developer",
                "slug": "python-developer",
                "description": "Specializes in building high-throughput backend services, automation pipelines, REST APIs, and database integrations.",
                "overview": "Python Developers design scalable web applications, asynchronous task processors, and backend architectures. Strong mastery of OOP, Django or FastAPI, PostgreSQL optimization, and caching is central to this track.",
                "icon": "Code",
                "demand_level": "High Demand",
                "salary": "$80,000 - $125,000 / yr",
                "requirements": [
                    ("Python", 5, True, "Primary programming language"),
                    ("Django", 5, True, "Web application framework"),
                    ("RESTful APIs", 5, True, "API architecture and serializers"),
                    ("PostgreSQL", 4, True, "Complex SQL queries and ORM optimization"),
                    ("Redis", 3, False, "In-memory caching and session queues"),
                    ("Git", 4, True, "Source version control"),
                    ("Docker", 4, True, "Containerized development workflows"),
                    ("Linux", 3, False, "Server navigation and environment configuration"),
                    ("SQL", 4, True, "Relational data querying and transactions"),
                ]
            },
            {
                "title": "Data Analyst",
                "slug": "data-analyst",
                "description": "Transforms raw transactional data into actionable business intelligence, dashboards, and growth insights.",
                "overview": "Data Analysts collaborate with business stakeholders to diagnose performance, build predictive models, and communicate narrative dashboards using SQL, Python, and data visualization tools.",
                "icon": "BarChart3",
                "demand_level": "High Demand",
                "salary": "$70,000 - $110,000 / yr",
                "requirements": [
                    ("SQL", 5, True, "Window functions, aggregations, and query optimization"),
                    ("Python", 5, True, "Data wrangling, scripting, and pipeline automation"),
                    ("Pandas", 5, True, "DataFrame transformations and statistical summaries"),
                    ("NumPy", 4, True, "Numerical array manipulation"),
                    ("Data Analysis", 5, True, "Exploratory data analysis and trend extraction"),
                    ("PostgreSQL", 3, False, "Relational database operations"),
                    ("Git", 3, False, "Reproducible research and analysis tracking"),
                ]
            },
            {
                "title": "AI Engineer",
                "slug": "ai-engineer",
                "description": "Designs, trains, fine-tunes, and deploys intelligent machine learning models, GenAI agents, and deep learning pipelines.",
                "overview": "AI Engineers bridge theoretical machine learning research with scalable production deployments. Key responsibilities include model training, LLM orchestration, vector search, and API serving.",
                "icon": "Cpu",
                "demand_level": "Extremely High Demand",
                "salary": "$110,000 - $170,000 / yr",
                "requirements": [
                    ("Python", 5, True, "Core language for ML research and development"),
                    ("Machine Learning", 5, True, "Supervised and unsupervised statistical learning"),
                    ("Deep Learning", 5, True, "Neural network architectures and backpropagation"),
                    ("PyTorch", 5, True, "Deep learning training and tensor operations"),
                    ("Scikit-learn", 4, True, "Predictive classification and regression models"),
                    ("Pandas", 4, True, "Data preprocessing and feature engineering"),
                    ("NumPy", 4, True, "Vectorized mathematical computations"),
                    ("Docker", 4, True, "Model containerization and microservice serving"),
                    ("Git", 4, True, "Experiment tracking and code versioning"),
                ]
            },
            {
                "title": "Cybersecurity Analyst",
                "slug": "cybersecurity-analyst",
                "description": "Monitors network traffic, evaluates application security posture, detects vulnerabilities, and defends infrastructure.",
                "overview": "Cybersecurity Analysts protect organizational data and infrastructure from breaches. Roles encompass penetration testing, vulnerability management, security information and event management (SIEM), and protocol auditing.",
                "icon": "ShieldCheck",
                "demand_level": "High Demand",
                "salary": "$80,000 - $130,000 / yr",
                "requirements": [
                    ("Network Security", 5, True, "TCP/IP architecture, firewall configuration, DNS, and SSL/TLS"),
                    ("OWASP", 5, True, "Web application security risks, SQLi, and XSS remediation"),
                    ("Wireshark", 4, True, "Packet sniffing and packet header forensic inspection"),
                    ("Penetration Testing", 4, True, "Exploitation methodologies and vulnerability audits"),
                    ("Linux", 4, True, "System logs, permission boundaries, and shell hardening"),
                    ("Python", 3, False, "Security scripting and automation tasks"),
                    ("Git", 3, False, "Version control"),
                ]
            },
            {
                "title": "Cloud Engineer",
                "slug": "cloud-engineer",
                "description": "Architects, provisions, and automates resilient cloud infrastructure, microservices, and CI/CD pipelines.",
                "overview": "Cloud Engineers ensure high availability, fault tolerance, and automated scaling of distributed cloud workloads across AWS, GCP, and Azure using Infrastructure as Code (IaC) and Kubernetes.",
                "icon": "Cloud",
                "demand_level": "Very High Demand",
                "salary": "$90,000 - $145,000 / yr",
                "requirements": [
                    ("Linux", 5, True, "Server administration, systemd, networking, and bash scripting"),
                    ("AWS", 5, True, "VPCs, EC2, S3, IAM security, and serverless compute"),
                    ("Docker", 5, True, "Multi-stage container builds and container security"),
                    ("Kubernetes", 4, True, "Cluster orchestration, deployments, and ingress routing"),
                    ("CI/CD", 4, True, "Automated testing, build pipelines, and zero-downtime deploys"),
                    ("Python", 3, False, "Infrastructure scripting and cloud automation SDKs"),
                    ("Git", 4, True, "GitOps and code collaboration"),
                ]
            }
        ]

        career_role_objs = {}
        for rdata in career_roles_data:
            role, _ = CareerRole.objects.get_or_create(
                slug=rdata["slug"],
                defaults={
                    "title": rdata["title"],
                    "description": rdata["description"],
                    "overview": rdata["overview"],
                    "icon": rdata["icon"],
                    "demand_level": rdata["demand_level"],
                    "avg_salary_range": rdata["salary"],
                }
            )
            career_role_objs[rdata["slug"]] = role

            # Add required skills
            for sname, weight, mandatory, note in rdata["requirements"]:
                if sname in skill_objs:
                    RequiredSkill.objects.update_or_create(
                        career_role=role,
                        skill=skill_objs[sname],
                        defaults={
                            'weight': weight,
                            'is_mandatory': mandatory,
                            'importance_note': note
                        }
                    )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(career_role_objs)} career roles with weighted required skills."))

        # 3. Create Project Recommendations
        projects_data = [
            {
                "role_slug": "full-stack-developer",
                "title": "SkillBridge Career & Analytics Hub",
                "difficulty": "INTERMEDIATE",
                "desc": "A production-grade full-stack platform featuring JWT role-based authentication, resume NLP extraction, real-time skill matching algorithms, and automated roadmap tracking.",
                "tech": ["React.js", "Django", "PostgreSQL", "Tailwind CSS", "Docker"],
                "features": [
                    "Multi-role user authentication (Student, Mentor, Admin)",
                    "PDF & DOCX parsing using PyMuPDF and python-docx",
                    "Transparent career readiness scoring algorithm",
                    "Interactive Kanban-style learning roadmap with progress bars",
                    "Real-time internship and job application tracking portal"
                ],
                "steps": [
                    "Set up normalized PostgreSQL models with foreign key constraints",
                    "Implement Django REST Framework API endpoints with JWT authentication",
                    "Build resume parsing engine using PyMuPDF and technical skills dictionary",
                    "Design responsive Tailwind CSS client interface with reusable components",
                    "Integrate API state management, error handlers, and interactive quizzes"
                ],
                "hours": 30,
                "github": "https://github.com/example/skillbridge-fullstack"
            },
            {
                "role_slug": "full-stack-developer",
                "title": "CloudTask: Real-Time Collaborative Workspace",
                "difficulty": "ADVANCED",
                "desc": "A scalable multi-tenant project management SaaS with live WebSockets updates, file attachments, and audit logs.",
                "tech": ["React.js", "Node.js", "Redis", "PostgreSQL", "Docker"],
                "features": [
                    "Real-time collaborative task boards with drag-and-drop",
                    "Role-based permission boundaries (Viewer, Editor, Owner)",
                    "Redis pub/sub for instant client updates without page reload"
                ],
                "steps": [
                    "Configure WebSocket server and client connection listeners",
                    "Implement optimistic UI updates in React",
                    "Deploy behind Nginx reverse proxy with SSL termination"
                ],
                "hours": 35,
                "github": "https://github.com/example/cloudtask"
            },
            {
                "role_slug": "python-developer",
                "title": "FastAPI Distributed Web Scraper & Alert Engine",
                "difficulty": "INTERMEDIATE",
                "desc": "Asynchronous high-concurrency web scraping system that monitors eCommerce product pricing and sends instant webhook alerts upon threshold drops.",
                "tech": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
                "features": [
                    "Asynchronous requests handling 200+ concurrent targets",
                    "PostgreSQL time-series price history tracking",
                    "Automated rate-limiting and rotating user-agent headers"
                ],
                "steps": [
                    "Set up async database connection pools with SQLAlchemy/asyncpg",
                    "Implement Celery/Redis worker queues for scheduled crawling",
                    "Build automated Discord/Slack notification webhooks"
                ],
                "hours": 20,
                "github": "https://github.com/example/fastapi-price-tracker"
            },
            {
                "role_slug": "data-analyst",
                "title": "E-Commerce Customer Churn & Cohort Retention Study",
                "difficulty": "BEGINNER",
                "desc": "End-to-end analytical study on 500,000+ transaction records calculating customer lifetime value (LTV), monthly churn rates, and cohort retention tables.",
                "tech": ["Python", "Pandas", "SQL", "PostgreSQL"],
                "features": [
                    "Monthly cohort retention heatmap matrix",
                    "RFM (Recency, Frequency, Monetary) customer segmentation",
                    "Executive visual summary deck with business recommendations"
                ],
                "steps": [
                    "Clean and normalize transactional logs handling missing customer IDs",
                    "Execute analytical SQL queries using window functions and CTEs",
                    "Generate interactive Plotly and Seaborn visualizations"
                ],
                "hours": 18,
                "github": "https://github.com/example/cohort-retention-analysis"
            },
            {
                "role_slug": "ai-engineer",
                "title": "DocuMind: RAG-Powered Technical Documentation Assistant",
                "difficulty": "ADVANCED",
                "desc": "Production Retrieval-Augmented Generation application that indexes enterprise PDF engineering manuals into a vector store and provides cited, hallucination-free answers.",
                "tech": ["Python", "PyTorch", "LangChain", "Docker", "Machine Learning"],
                "features": [
                    "Document chunking and dense vector embedding generation",
                    "Semantic hybrid similarity search with cosine distance filtering",
                    "Streaming response generator with source citation page metadata"
                ],
                "steps": [
                    "Extract and clean text from technical manuals with PyMuPDF",
                    "Generate dense embeddings using a HuggingFace Transformer model",
                    "Store and query embeddings via vector database",
                    "Assemble prompt chain with grounding context and system safety guardrails"
                ],
                "hours": 32,
                "github": "https://github.com/example/documind-rag"
            },
            {
                "role_slug": "cybersecurity-analyst",
                "title": "Automated Network Vulnerability & Port Scanner",
                "difficulty": "INTERMEDIATE",
                "desc": "A network security utility that identifies open ports, banner grabs service versions, and matches banners against known CVE vulnerability databases.",
                "tech": ["Python", "Network Security", "Linux", "Wireshark"],
                "features": [
                    "Multi-threaded TCP SYN and UDP socket probing",
                    "Automated CVE lookup against the National Vulnerability Database API",
                    "HTML security audit report generation with risk severity ratings"
                ],
                "steps": [
                    "Implement non-blocking socket connections with timeout handling",
                    "Parse server response headers and service identification strings",
                    "Generate formatted executive summary reports with remediation checklists"
                ],
                "hours": 24,
                "github": "https://github.com/example/network-vuln-scanner"
            },
            {
                "role_slug": "cloud-engineer",
                "title": "Highly Available Microservice Infrastructure with Terraform & AWS",
                "difficulty": "ADVANCED",
                "desc": "Complete Infrastructure as Code (IaC) repository that provisions a multi-AZ VPC, Auto-Scaling EC2 instances, Application Load Balancer, and Aurora PostgreSQL database.",
                "tech": ["AWS", "Docker", "Linux", "CI/CD"],
                "features": [
                    "Zero hardcoded credentials using AWS IAM least-privilege roles",
                    "Automated zero-downtime rolling updates via GitHub Actions",
                    "CloudWatch alarms and metric dashboard alerting on 5xx errors"
                ],
                "steps": [
                    "Write modular Terraform declarations for networking and compute",
                    "Configure security groups restricting database access exclusively to private subnets",
                    "Test automated teardown and recreation to verify idempotency"
                ],
                "hours": 28,
                "github": "https://github.com/example/aws-terraform-infra"
            }
        ]

        for p in projects_data:
            role = career_role_objs.get(p["role_slug"])
            if role:
                proj, _ = ProjectRecommendation.objects.get_or_create(
                    title=p["title"],
                    career_role=role,
                    defaults={
                        "difficulty": p["difficulty"],
                        "description": p["desc"],
                        "technologies": p["tech"],
                        "features": p["features"],
                        "implementation_steps": p["steps"],
                        "estimated_hours": p["hours"],
                        "github_starter_url": p["github"]
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(projects_data)} recommended projects."))

        # 4. Create Technical Assessments & Questions
        assessments_data = [
            {
                "title": "Python Core & Logic Mastery",
                "slug": "python-core",
                "category": "Python",
                "difficulty": "INTERMEDIATE",
                "desc": "Test your knowledge of Python 3 data structures, OOP principles, closures, decorators, and memory handling.",
                "time_limit": 15,
                "passing_pct": 70,
                "questions": [
                    {
                        "q": "What will be the output of the following Python code snippet?",
                        "code": "def func(x, l=[]):\n    l.append(x)\n    return l\n\nprint(func(1))\nprint(func(2))",
                        "options": [
                            {"id": "A", "text": "[1] and [2]"},
                            {"id": "B", "text": "[1] and [1, 2]"},
                            {"id": "C", "text": "[1, 2] and [1, 2]"},
                            {"id": "D", "text": "TypeError: default argument mutability"}
                        ],
                        "correct": "B",
                        "explanation": "Default arguments in Python are evaluated once when the function definition is executed, not each time the function is called. Hence, mutable defaults like lists persist modifications across calls.",
                        "order": 1
                    },
                    {
                        "q": "Which Python built-in module provides support for establishing Abstract Base Classes (ABCs)?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "sys"},
                            {"id": "B", "text": "abc"},
                            {"id": "C", "text": "typing"},
                            {"id": "D", "text": "types"}
                        ],
                        "correct": "B",
                        "explanation": "The 'abc' module provides the infrastructure for defining Abstract Base Classes (ABCs) using the @abstractmethod decorator and ABC base class.",
                        "order": 2
                    },
                    {
                        "q": "What is the primary difference between a Python generator and a standard function returning a list?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "Generators can only yield numbers, while functions can return any type."},
                            {"id": "B", "text": "Generators produce items lazily on demand using 'yield', drastically conserving memory."},
                            {"id": "C", "text": "Generators run in a separate operating system thread."},
                            {"id": "D", "text": "Generators do not support looping with 'for' loops."}
                        ],
                        "correct": "B",
                        "explanation": "Generators produce sequence values lazily one at a time using 'yield', yielding each element on demand without buffering the entire dataset in RAM.",
                        "order": 3
                    },
                    {
                        "q": "In Python dictionary lookups, what is the average time complexity for retrieval by key?",
                        "code": "val = my_dict['target_key']",
                        "options": [
                            {"id": "A", "text": "O(N)"},
                            {"id": "B", "text": "O(log N)"},
                            {"id": "C", "text": "O(1)"},
                            {"id": "D", "text": "O(N log N)"}
                        ],
                        "correct": "C",
                        "explanation": "Python dictionaries are implemented using hash tables. Under standard distribution, key lookup has an average amortized time complexity of O(1).",
                        "order": 4
                    },
                    {
                        "q": "Which keyword is used in Python 3.5+ to define a coroutine function for asynchronous I/O?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "def async"},
                            {"id": "B", "text": "async def"},
                            {"id": "C", "text": "thread def"},
                            {"id": "D", "text": "yield def"}
                        ],
                        "correct": "B",
                        "explanation": "'async def' is the syntax in Python for defining native coroutines that can be scheduled by the asyncio event loop and use the 'await' keyword.",
                        "order": 5
                    }
                ]
            },
            {
                "title": "SQL & Relational Database Queries",
                "slug": "sql-queries",
                "category": "SQL",
                "difficulty": "INTERMEDIATE",
                "desc": "Assess your expertise in relational SQL queries, joins, window functions, indexes, and aggregation.",
                "time_limit": 15,
                "passing_pct": 70,
                "questions": [
                    {
                        "q": "Which SQL clause is used to filter records after an aggregate GROUP BY operation?",
                        "code": "SELECT department, COUNT(*) FROM employees GROUP BY department ... COUNT(*) > 5;",
                        "options": [
                            {"id": "A", "text": "WHERE"},
                            {"id": "B", "text": "HAVING"},
                            {"id": "C", "text": "FILTER"},
                            {"id": "D", "text": "ORDER BY"}
                        ],
                        "correct": "B",
                        "explanation": "WHERE filters rows before grouping occurs; HAVING filters grouped result sets after aggregation functions have been computed.",
                        "order": 1
                    },
                    {
                        "q": "What is the difference between UNION and UNION ALL in SQL?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "UNION merges rows without removing duplicates, while UNION ALL eliminates duplicates."},
                            {"id": "B", "text": "UNION removes duplicate rows, whereas UNION ALL preserves all rows including duplicates."},
                            {"id": "C", "text": "UNION can only combine tables from different databases."},
                            {"id": "D", "text": "There is no functional difference."}
                        ],
                        "correct": "B",
                        "explanation": "UNION runs an implicit DISTINCT sorting pass to filter out duplicate rows across result sets, whereas UNION ALL concatenates results directly, making it faster.",
                        "order": 2
                    },
                    {
                        "q": "Which window function assigns a sequential unique integer to each row within a partition starting at 1?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "RANK()"},
                            {"id": "B", "text": "DENSE_RANK()"},
                            {"id": "C", "text": "ROW_NUMBER()"},
                            {"id": "D", "text": "NTILE()"}
                        ],
                        "correct": "C",
                        "explanation": "ROW_NUMBER() produces a consecutive integer for every row without gaps or duplicates, regardless of tied values in the ORDER BY clause.",
                        "order": 3
                    },
                    {
                        "q": "What index type is the standard default for primary keys in PostgreSQL and MySQL InnoDB?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "B-Tree Index"},
                            {"id": "B", "text": "Hash Index"},
                            {"id": "C", "text": "GIN Index"},
                            {"id": "D", "text": "BRIN Index"}
                        ],
                        "correct": "A",
                        "explanation": "B-Tree (Balanced Tree) is the default and most versatile index type in relational engines, delivering O(log N) lookup, insertion, and range queries.",
                        "order": 4
                    },
                    {
                        "q": "What happens when you perform a LEFT JOIN between Table A and Table B and a row in Table A has no match in Table B?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "The row from Table A is excluded from the final result."},
                            {"id": "B", "text": "The query fails with a Foreign Key constraint violation."},
                            {"id": "C", "text": "The row from Table A is returned, with NULL values for all columns of Table B."},
                            {"id": "D", "text": "Empty strings ('') are inserted for Table B columns."}
                        ],
                        "correct": "C",
                        "explanation": "A LEFT JOIN preserves every row from the left table; if no corresponding match is present in the right table, columns from the right table evaluate to NULL.",
                        "order": 5
                    }
                ]
            },
            {
                "title": "Modern JavaScript & Async Programming",
                "slug": "javascript-core",
                "category": "JavaScript",
                "difficulty": "INTERMEDIATE",
                "desc": "Evaluate your mastery of ES6+, event loop execution, closures, Promises, and prototype mechanics.",
                "time_limit": 15,
                "passing_pct": 70,
                "questions": [
                    {
                        "q": "What is logged to the console by the following code?",
                        "code": "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
                        "options": [
                            {"id": "A", "text": "A, B, C, D"},
                            {"id": "B", "text": "A, D, B, C"},
                            {"id": "C", "text": "A, D, C, B"},
                            {"id": "D", "text": "A, C, D, B"}
                        ],
                        "correct": "C",
                        "explanation": "Synchronous code ('A', 'D') runs first. Microtasks (Promise.then callbacks: 'C') have priority over macrotasks (setTimeout callbacks: 'B'). Therefore, the output order is A, D, C, B.",
                        "order": 1
                    },
                    {
                        "q": "What is the primary characteristic of a closure in JavaScript?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "A function that has been frozen using Object.freeze()"},
                            {"id": "B", "text": "A function that retains access to variables from its outer lexical scope even after the outer function has finished executing"},
                            {"id": "C", "text": "A function with zero parameters"},
                            {"id": "D", "text": "An immediately invoked function expression (IIFE)"}
                        ],
                        "correct": "B",
                        "explanation": "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment).",
                        "order": 2
                    },
                    {
                        "q": "Which array method creates a new array with all elements that pass the test implemented by the provided callback function?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "map()"},
                            {"id": "B", "text": "forEach()"},
                            {"id": "C", "text": "filter()"},
                            {"id": "D", "text": "reduce()"}
                        ],
                        "correct": "C",
                        "explanation": "Array.prototype.filter() returns a new array containing all elements that evaluate to truthy against the predicate function.",
                        "order": 3
                    },
                    {
                        "q": "What is the difference between '==' and '===' operators in JavaScript?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "'==' performs type coercion before comparison; '===' checks both value and type without coercion."},
                            {"id": "B", "text": "'===' is only used for comparing Objects and Arrays."},
                            {"id": "C", "text": "'==' is stricter and faster than '==='."},
                            {"id": "D", "text": "They are completely identical in ES6."}
                        ],
                        "correct": "A",
                        "explanation": "The abstract equality operator ('==') converts operands to a common type before comparing, while strict equality ('===') requires both type and value to match.",
                        "order": 4
                    },
                    {
                        "q": "How does 'const' behave when applied to an Object in JavaScript?",
                        "code": "const user = { name: 'Alice' };\nuser.name = 'Bob';",
                        "options": [
                            {"id": "A", "text": "It throws a TypeError because properties cannot be modified."},
                            {"id": "B", "text": "It successfully updates user.name to 'Bob' because 'const' prevents reassignment of the variable binding, not internal property mutation."},
                            {"id": "C", "text": "It silently ignores the change without error."},
                            {"id": "D", "text": "It converts user into an immutable tuple."}
                        ],
                        "correct": "B",
                        "explanation": "'const' creates an immutable binding to the memory reference. While you cannot reassign user = {}, you can mutate its internal properties.",
                        "order": 5
                    }
                ]
            },
            {
                "title": "HTML5 & Semantic Web Architecture",
                "slug": "html5-semantics",
                "category": "HTML5",
                "difficulty": "BEGINNER",
                "desc": "Check your understanding of semantic HTML5 elements, web accessibility (a11y), forms, and SEO best practices.",
                "time_limit": 12,
                "passing_pct": 70,
                "questions": [
                    {
                        "q": "Which HTML5 semantic element should encapsulate the primary navigation links of a web page?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "<menu>"},
                            {"id": "B", "text": "<nav>"},
                            {"id": "C", "text": "<header>"},
                            {"id": "D", "text": "<links>"}
                        ],
                        "correct": "B",
                        "explanation": "The <nav> tag is the HTML5 semantic container designated specifically for major navigation blocks, helping screen readers and search engines identify site navigation.",
                        "order": 1
                    },
                    {
                        "q": "What is the purpose of the 'alt' attribute on an <img> tag?",
                        "code": "<img src=\"logo.png\" alt=\"SkillBridge Platform Logo\" />",
                        "options": [
                            {"id": "A", "text": "Specifies hover tooltip text displayed over the image."},
                            {"id": "B", "text": "Provides alternative descriptive text for screen readers and when the image fails to load."},
                            {"id": "C", "text": "Defines an alternate URL if the main image source fails."},
                            {"id": "D", "text": "Sets image aspect ratio in CSS."}
                        ],
                        "correct": "B",
                        "explanation": "The 'alt' attribute provides critical accessibility context for visually impaired users utilizing screen readers and serves as text fallback if the image asset fails to render.",
                        "order": 2
                    },
                    {
                        "q": "Which doctype declaration correctly identifies an HTML5 document?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "<!DOCTYPE html>"},
                            {"id": "B", "text": "<!DOCTYPE HTML5 PUBLIC>"},
                            {"id": "C", "text": "<!DOCTYPE html-5>"},
                            {"id": "D", "text": "<!HTML DOCTYPE>"}
                        ],
                        "correct": "A",
                        "explanation": "<!DOCTYPE html> is the concise, case-insensitive doctype declaration required to trigger standard rendering mode in modern browsers for HTML5.",
                        "order": 3
                    },
                    {
                        "q": "Which input type attribute ensures that mobile devices open a specialized numeric keypad for telephone entry?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "type=\"number\""},
                            {"id": "B", "text": "type=\"tel\""},
                            {"id": "C", "text": "type=\"phone\""},
                            {"id": "D", "text": "type=\"digit\""}
                        ],
                        "correct": "B",
                        "explanation": "Using type='tel' prompts mobile browsers to present an optimized phone keypad while maintaining custom pattern formatting flexibility.",
                        "order": 4
                    },
                    {
                        "q": "What is the semantic difference between the <strong> tag and the <b> tag in HTML5?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "There is no difference; both are visual tags only."},
                            {"id": "B", "text": "<strong> conveys semantic importance, seriousness, or urgency, while <b> represents stylistic bolding without added importance."},
                            {"id": "C", "text": "<b> is modern; <strong> is deprecated."},
                            {"id": "D", "text": "<strong> can only be used inside headings."}
                        ],
                        "correct": "B",
                        "explanation": "HTML5 separates semantics from styling: <strong> indicates that its contents have strong importance or urgency, whereas <b> is merely visual bold text without structural semantic weight.",
                        "order": 5
                    }
                ]
            },
            {
                "title": "Modern CSS3 & Responsive Layouts",
                "slug": "css3-layouts",
                "category": "CSS3",
                "difficulty": "BEGINNER",
                "desc": "Assess your skills in CSS Grid, Flexbox, box-sizing, media queries, and responsive component styling.",
                "time_limit": 12,
                "passing_pct": 70,
                "questions": [
                    {
                        "q": "When 'box-sizing: border-box' is applied to an element, how is the total width calculated?",
                        "code": ".card {\n  box-sizing: border-box;\n  width: 300px;\n  padding: 20px;\n  border: 2px solid black;\n}",
                        "options": [
                            {"id": "A", "text": "Total width = 300px + 40px (padding) + 4px (border) = 344px"},
                            {"id": "B", "text": "Total rendered width remains exactly 300px, absorbing padding and border inside"},
                            {"id": "C", "text": "Total width = 300px + 20px = 320px"},
                            {"id": "D", "text": "The border is ignored from width calculation."}
                        ],
                        "correct": "B",
                        "explanation": "'box-sizing: border-box' forces padding and borders to be included within the specified width and height, preventing layout breakage and size inflation.",
                        "order": 1
                    },
                    {
                        "q": "In CSS Flexbox, which property aligns items along the cross axis (perpendicular to the main axis)?",
                        "code": ".container {\n  display: flex;\n  flex-direction: row;\n  ...: center;\n}",
                        "options": [
                            {"id": "A", "text": "justify-content"},
                            {"id": "B", "text": "align-items"},
                            {"id": "C", "text": "flex-wrap"},
                            {"id": "D", "text": "align-content"}
                        ],
                        "correct": "B",
                        "explanation": "'justify-content' manages alignment along the main axis, while 'align-items' governs alignment along the perpendicular cross axis.",
                        "order": 2
                    },
                    {
                        "q": "Which CSS Grid property value creates responsive columns that automatically wrap and fit available space without manual media queries?",
                        "code": "grid-template-columns: repeat(..., minmax(250px, 1fr));",
                        "options": [
                            {"id": "A", "text": "auto-fit"},
                            {"id": "B", "text": "wrap-always"},
                            {"id": "C", "text": "flex-auto"},
                            {"id": "D", "text": "100%"}
                        ],
                        "correct": "A",
                        "explanation": "'repeat(auto-fit, minmax(250px, 1fr))' instructs the grid to pack as many 250px+ tracks as possible into the container and stretch them to occupy remaining fraction units.",
                        "order": 3
                    },
                    {
                        "q": "What CSS unit is calculated relative to the font-size of the root <html> element?",
                        "code": "font-size: 1.5...;",
                        "options": [
                            {"id": "A", "text": "em"},
                            {"id": "B", "text": "rem"},
                            {"id": "C", "text": "vh"},
                            {"id": "D", "text": "%"}
                        ],
                        "correct": "B",
                        "explanation": "'rem' stands for 'Root EM', and is computed relative to the root element's font-size (usually 16px by default), avoiding cascading compound sizing issues of 'em'.",
                        "order": 4
                    },
                    {
                        "q": "Which CSS property enables hardware-accelerated animations by rendering changes on the GPU without triggering layout reflow?",
                        "code": "",
                        "options": [
                            {"id": "A", "text": "transform and opacity"},
                            {"id": "B", "text": "width and height"},
                            {"id": "C", "text": "top and left"},
                            {"id": "D", "text": "margin and padding"}
                        ],
                        "correct": "A",
                        "explanation": "Animating 'transform' (translate, scale, rotate) and 'opacity' bypasses layout recalculation and paint cycles, compositing directly on the GPU for 60fps animations.",
                        "order": 5
                    }
                ]
            }
        ]

        for adata in assessments_data:
            assm, _ = Assessment.objects.get_or_create(
                slug=adata["slug"],
                defaults={
                    "title": adata["title"],
                    "category": adata["category"],
                    "difficulty": adata["difficulty"],
                    "description": adata["desc"],
                    "time_limit_minutes": adata["time_limit"],
                    "passing_percentage": adata["passing_pct"]
                }
            )

            # Associate related Skill
            if adata["category"] in skill_objs:
                assm.skill = skill_objs[adata["category"]]
                assm.save()

            for qdata in adata["questions"]:
                Question.objects.get_or_create(
                    assessment=assm,
                    order=qdata["order"],
                    defaults={
                        "question_text": qdata["q"],
                        "code_snippet": qdata["code"],
                        "options": qdata["options"],
                        "correct_option": qdata["correct"],
                        "explanation": qdata["explanation"]
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(assessments_data)} technical assessments with detailed questions."))

        # 5. Create Job & Internship Listings
        jobs_data = [
            {
                "title": "Junior Full Stack Developer Intern",
                "company": "NextWave Innovations",
                "logo": "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80",
                "type": "INTERNSHIP",
                "exp": "INTERN",
                "location": "Remote / Bengaluru, India",
                "remote": True,
                "salary": "$1,200 / month stipend",
                "desc": "Join our dynamic agile engineering squad building real-time micro-SaaS applications using React, Django, and PostgreSQL.",
                "responsibilities": [
                    "Develop reusable React UI components with Tailwind CSS",
                    "Build, test, and document RESTful endpoints in Django REST Framework",
                    "Participate in weekly sprint planning and code review sessions"
                ],
                "skills": ["JavaScript", "React.js", "Python", "Django", "PostgreSQL", "Git"],
                "role_slug": "full-stack-developer"
            },
            {
                "title": "Python Backend Engineering Intern",
                "company": "CloudScale Systems",
                "logo": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
                "type": "INTERNSHIP",
                "exp": "INTERN",
                "location": "Hyderabad / Hybrid",
                "remote": True,
                "salary": "$1,000 / month stipend",
                "desc": "Work directly on high-performance data pipelines, database query optimization, and Redis caching layers.",
                "responsibilities": [
                    "Write robust Python backend APIs with comprehensive unit test coverage",
                    "Optimize relational queries in PostgreSQL to handle 1M+ rows",
                    "Containerize local development services using Docker"
                ],
                "skills": ["Python", "Django", "SQL", "PostgreSQL", "Docker", "Git"],
                "role_slug": "python-developer"
            },
            {
                "title": "Data Analyst Graduate Associate",
                "company": "FinMetrics Global",
                "logo": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80",
                "type": "FULL_TIME",
                "exp": "ENTRY",
                "location": "New York, NY / Remote",
                "remote": True,
                "salary": "$68,000 - $85,000 / yr",
                "desc": "Extract meaningful growth insights from cross-border financial transaction logs using SQL, Pandas, and interactive dashboards.",
                "responsibilities": [
                    "Author advanced SQL queries using window functions and CTEs",
                    "Automate weekly executive metric reports with Python scripts",
                    "Present cohort retention trends and revenue forecasts to leadership"
                ],
                "skills": ["SQL", "Python", "Pandas", "Data Analysis", "NumPy", "PostgreSQL"],
                "role_slug": "data-analyst"
            },
            {
                "title": "AI & Machine Learning Research Intern",
                "company": "DeepCognition Labs",
                "logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
                "type": "INTERNSHIP",
                "exp": "INTERN",
                "location": "San Francisco, CA / Remote",
                "remote": True,
                "salary": "$1,500 / month stipend",
                "desc": "Contribute to cutting-edge Retrieval-Augmented Generation (RAG) experiments and transformer model fine-tuning.",
                "responsibilities": [
                    "Prepare and clean multimodal evaluation datasets in Python",
                    "Fine-tune PyTorch embedding models for technical documentation domain",
                    "Evaluate latency benchmarks for vector search implementations"
                ],
                "skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "Scikit-learn", "Git"],
                "role_slug": "ai-engineer"
            },
            {
                "title": "Junior Cybersecurity Defense Analyst",
                "company": "Sentinel Shield Security",
                "logo": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80",
                "type": "FULL_TIME",
                "exp": "ENTRY",
                "location": "Washington, DC / Remote",
                "remote": True,
                "salary": "$72,000 - $92,000 / yr",
                "desc": "Monitor network perimeter events, audit web application vulnerabilities against OWASP Top 10, and draft security briefs.",
                "responsibilities": [
                    "Analyze suspicious network packet flows with Wireshark",
                    "Perform routine dynamic vulnerability scanning on staging environments",
                    "Assist in incident response documentation and breach prevention audits"
                ],
                "skills": ["Network Security", "OWASP", "Wireshark", "Linux", "Python"],
                "role_slug": "cybersecurity-analyst"
            },
            {
                "title": "Associate Cloud & DevOps Engineer",
                "company": "SkyHigh Cloud Systems",
                "logo": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80",
                "type": "FULL_TIME",
                "exp": "ENTRY",
                "location": "Austin, TX / Hybrid",
                "remote": False,
                "salary": "$80,000 - $105,000 / yr",
                "desc": "Automate cloud deployment pipelines using GitHub Actions, Docker containers, and AWS cloud resources.",
                "responsibilities": [
                    "Maintain multi-stage CI/CD test and deployment workflows",
                    "Configure AWS VPC subnets, security groups, and EC2 instances",
                    "Implement server health monitoring and automatic log aggregation"
                ],
                "skills": ["AWS", "Docker", "Linux", "CI/CD", "Git", "Python"],
                "role_slug": "cloud-engineer"
            }
        ]

        for j in jobs_data:
            role = career_role_objs.get(j["role_slug"])
            job, _ = JobOpportunity.objects.get_or_create(
                title=j["title"],
                company_name=j["company"],
                defaults={
                    "company_logo": j["logo"],
                    "job_type": j["type"],
                    "experience_level": j["exp"],
                    "location": j["location"],
                    "is_remote": j["remote"],
                    "salary_range": j["salary"],
                    "description": j["desc"],
                    "responsibilities": j["responsibilities"],
                    "career_role": role,
                    "apply_url": "https://example.com/apply-demo",
                    "is_active": True
                }
            )
            # Add required skills
            for sn in j["skills"]:
                if sn in skill_objs:
                    job.required_skills.add(skill_objs[sn])

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(jobs_data)} job and internship opportunities."))

        # 6. Create Demonstration Users (Admin, Mentors, Student)
        # Admin
        admin_user, created = User.objects.get_or_create(
            email='admin@skillbridge.edu',
            defaults={
                'username': 'admin',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True
            }
        )
        if created:
            admin_user.set_password('AdminPass123!')
            admin_user.save()

        # Mentor 1
        mentor1, created = User.objects.get_or_create(
            email='mentor.alex@skillbridge.edu',
            defaults={
                'username': 'mentor_alex',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'role': User.Role.MENTOR,
                'is_verified': True,
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
        )
        if created:
            mentor1.set_password('MentorPass123!')
            mentor1.save()
            MentorProfile.objects.create(
                user=mentor1,
                organization="Stripe / TechCorp",
                designation="Staff Full Stack & Cloud Architect",
                experience_years=8,
                expertise_areas=["Full Stack Development", "System Design", "Cloud Infrastructure", "Django & React"],
                linkedin_url="https://linkedin.com/in/alex-rivera-tech",
                bio="Passionate engineer with 8+ years scaling high-availability distributed systems. I love guiding students from syntax basics to production architecture.",
                is_approved=True
            )

        # Mentor 2
        mentor2, created = User.objects.get_or_create(
            email='mentor.sarah@skillbridge.edu',
            defaults={
                'username': 'mentor_sarah',
                'first_name': 'Sarah',
                'last_name': 'Chen',
                'role': User.Role.MENTOR,
                'is_verified': True,
                'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            }
        )
        if created:
            mentor2.set_password('MentorPass123!')
            mentor2.save()
            MentorProfile.objects.create(
                user=mentor2,
                organization="AI Frontier Labs",
                designation="Lead Data & Machine Learning Scientist",
                experience_years=6,
                expertise_areas=["Data Science", "Python Analytics", "Machine Learning", "AI Engineering"],
                linkedin_url="https://linkedin.com/in/sarah-chen-ai",
                bio="Former research fellow and current Lead Data Scientist. Excited to help fresh graduates build solid portfolios and master technical interviews.",
                is_approved=True
            )

        # Student User
        student_user, created = User.objects.get_or_create(
            email='student@skillbridge.edu',
            defaults={
                'username': 'student_user',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'role': User.Role.STUDENT,
                'is_verified': True,
                'avatar_url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
            }
        )
        if created:
            student_user.set_password('StudentPass123!')
            student_user.save()
            
            # Setup student profile
            full_stack_role = career_role_objs.get('full-stack-developer')
            profile = StudentProfile.objects.create(
                user=student_user,
                college_name="National Institute of Technology",
                degree="Bachelor of Technology",
                field_of_study="Computer Science & Engineering",
                graduation_year=2026,
                bio="Pre-final year engineering student passionate about building scalable full-stack applications and solving real-world challenges.",
                interests=["Web Development", "Open Source", "Cloud Architectures", "Modern UI/UX"],
                target_role_id=full_stack_role.id if full_stack_role else None,
                linkedin_url="https://linkedin.com/in/priya-sharma-cs",
                github_url="https://github.com/priya-sharma-cs"
            )

            # Assign some initial verified skills so student immediately sees progress
            initial_skills = [
                ("Python", "INTERMEDIATE", "RESUME", True),
                ("JavaScript", "INTERMEDIATE", "MANUAL", True),
                ("HTML5", "ADVANCED", "ASSESSMENT", True),
                ("CSS3", "INTERMEDIATE", "ASSESSMENT", True),
                ("Git", "INTERMEDIATE", "MANUAL", True),
                ("SQL", "INTERMEDIATE", "ASSESSMENT", True),
            ]
            for sname, prof, src, ver in initial_skills:
                if sname in skill_objs:
                    StudentSkill.objects.create(
                        user=student_user,
                        skill=skill_objs[sname],
                        proficiency=prof,
                        source=src,
                        is_verified=ver
                    )

            # Generate initial gap analysis & roadmap for the student
            if full_stack_role:
                analysis = perform_skill_gap_analysis(student_user, full_stack_role)
                roadmap = generate_or_update_roadmap(student_user, full_stack_role)
                # Mark first task completed to show realistic progress
                first_task = roadmap.tasks.first()
                if first_task:
                    first_task.is_completed = True
                    first_task.completed_at = timezone.now()
                    first_task.save()
                    roadmap.update_progress()

            # Connect student to Mentor Alex
            rel = MentorshipRelationship.objects.create(
                mentor=mentor1,
                student=student_user,
                status='ACTIVE',
                notes="Mentoring Priya on Full Stack project architecture and preparing for campus tech recruitment."
            )

            # Create upcoming session
            MentoringSession.objects.create(
                relationship=rel,
                title="Portfolio Architecture Review & Mock Technical Interview",
                agenda="1. Code review of Full Stack capstone application.\n2. Deep dive into React state optimization & Django ORM performance.\n3. Behavioral interview preparation.",
                scheduled_at=timezone.now() + timedelta(days=2, hours=3),
                duration_minutes=45,
                meeting_link="https://meet.google.com/sb-mentoring-session",
                status='SCHEDULED'
            )

            # Create sample mentor feedback
            MentorFeedback.objects.create(
                relationship=rel,
                feedback_text="Priya has demonstrated strong foundational command of Python and modern JavaScript. Recommend implementing Docker containerization and caching before applying to top-tier internship programs.",
                project_suggestions="Add Redis-based rate limiting to your API endpoints and publish a live interactive demo link in your README.",
                rating=5
            )

            # Add welcome notifications
            Notification.objects.create(
                user=student_user,
                title="Welcome to SkillBridge!",
                message="Your student profile is active. Upload your resume or take a technical assessment to start tracking your career readiness.",
                notification_type='SYSTEM',
                action_url='/dashboard'
            )
            Notification.objects.create(
                user=student_user,
                title="Mentor Alex Rivera Assigned",
                message="Your mentor has reviewed your profile and scheduled an upcoming 1-on-1 session.",
                notification_type='MENTORSHIP',
                action_url='/mentor-dashboard'
            )

        self.stdout.write(self.style.SUCCESS("Seeded users (Admin, Mentors, Student) with initial relations and notifications."))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("SkillBridge demo credentials:"))
        self.stdout.write(self.style.SUCCESS("  Student: student@skillbridge.edu  /  StudentPass123!"))
        self.stdout.write(self.style.SUCCESS("  Mentor:  mentor.alex@skillbridge.edu  /  MentorPass123!"))
        self.stdout.write(self.style.SUCCESS("  Admin:   admin@skillbridge.edu  /  AdminPass123!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
