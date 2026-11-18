"""
Skill Gap Analysis, Roadmap Generator, and Project Recommendation Service
Calculates transparent alignment percentages and generates actionable learning pathways.
"""

from django.utils import timezone
from .models import (
    CareerRole, Skill, RequiredSkill, StudentSkill,
    SkillAnalysis, LearningRoadmap, RoadmapTask, ProjectRecommendation
)
from accounts.models import StudentProfile

def perform_skill_gap_analysis(user, career_role: CareerRole) -> SkillAnalysis:
    """
    Performs transparent skill gap analysis:
    Readiness Score = (Sum of Matched Required Skill Weights / Sum of All Required Skill Weights) * 100
    """
    # Fetch all required skills for this career role
    required_skills_qs = RequiredSkill.objects.filter(career_role=career_role).select_related('skill')
    
    # Fetch user's registered skills
    user_skills_qs = StudentSkill.objects.filter(user=user).select_related('skill')
    user_skill_map = {us.skill.name.lower(): us for us in user_skills_qs}

    matched_skills = []
    missing_skills = []
    total_weight = 0
    matched_weight = 0

    for req in required_skills_qs:
        weight = req.weight
        total_weight += weight
        skill_name = req.skill.name
        skill_lower = skill_name.lower()

        if skill_lower in user_skill_map:
            user_skill = user_skill_map[skill_lower]
            matched_weight += weight
            matched_skills.append({
                "id": req.skill.id,
                "name": skill_name,
                "category": req.skill.get_category_display(),
                "weight": weight,
                "is_mandatory": req.is_mandatory,
                "proficiency": user_skill.proficiency,
                "is_verified": user_skill.is_verified,
                "importance_note": req.importance_note or "Core skill for this track"
            })
        else:
            missing_skills.append({
                "id": req.skill.id,
                "name": skill_name,
                "category": req.skill.get_category_display(),
                "weight": weight,
                "is_mandatory": req.is_mandatory,
                "importance_note": req.importance_note or "High priority for industry recruitment"
            })

    # Transparent score calculation
    readiness_score = round((matched_weight / total_weight * 100), 1) if total_weight > 0 else 0.0

    # Build constructive summary
    if readiness_score >= 80:
        summary = f"Exceptional alignment! You possess {len(matched_skills)} of {required_skills_qs.count()} key competencies for {career_role.title}. Focus on refining high-impact capstone projects and mock interview practice."
    elif readiness_score >= 50:
        summary = f"Solid baseline! You have matched {len(matched_skills)} required skills ({readiness_score}% readiness). Tackling the remaining {len(missing_skills)} missing skills will qualify you for competitive entry-level positions."
    else:
        summary = f"Great start on your journey toward {career_role.title}. You have acquired foundational competencies, and our personalized roadmap will guide you through {len(missing_skills)} target areas step-by-step."

    # Update or create analysis
    analysis, _ = SkillAnalysis.objects.update_or_create(
        user=user,
        career_role=career_role,
        defaults={
            'readiness_score': readiness_score,
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'total_required_weight': total_weight,
            'matched_weight': matched_weight,
            'recommendation_summary': summary,
            'disclaimer': "This readiness score reflects technical skill requirement alignment based on industry benchmarks. It is an indicative learning metric and does not guarantee employment."
        }
    )

    # Sync with StudentProfile
    profile, created = StudentProfile.objects.get_or_create(user=user)
    profile.readiness_score = readiness_score
    profile.target_role_id = career_role.id
    profile.save()

    return analysis


def generate_or_update_roadmap(user, career_role: CareerRole) -> LearningRoadmap:
    """
    Generates a personalized 3-stage learning roadmap for the student's targeted career path,
    customized around missing and core skills.
    """
    analysis = perform_skill_gap_analysis(user, career_role)
    missing_skill_names = [s['name'] for s in analysis.missing_skills]

    roadmap, created = LearningRoadmap.objects.get_or_create(
        user=user,
        career_role=career_role,
        defaults={
            'title': f"{career_role.title} Career Mastery Roadmap",
            'description': f"Personalized step-by-step curriculum customized for {user.get_full_name() or user.username} targeting {career_role.title}.",
            'estimated_weeks': 12,
            'progress_percentage': 0.0
        }
    )

    # If roadmap already has tasks, return it
    if roadmap.tasks.exists():
        roadmap.update_progress()
        return roadmap

    # Define tasks tailored to the career role
    role_slug = career_role.slug.lower()

    if "full-stack" in role_slug or "web" in role_slug:
        task_data = [
            {
                "stage": "Stage 1: Core Web Fundamentals",
                "title": "Modern JavaScript (ES6+) & DOM Architecture",
                "desc": "Master async/await, closures, array methods, fetch API, and responsive modern layout fundamentals.",
                "resources": [
                    {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "docs"},
                    {"title": "JavaScript.info Modern Tutorial", "url": "https://javascript.info/", "type": "article"}
                ],
                "exercise": "Build an interactive DOM-based Task & Habit Tracker with local storage persistence and dark mode.",
                "hours": 8, "order": 1
            },
            {
                "stage": "Stage 1: Core Web Fundamentals",
                "title": "Responsive Layouts with Tailwind CSS & CSS Grid",
                "desc": "Design fluid, mobile-first responsive interfaces using modern CSS Flexbox, Grid, and utility classes.",
                "resources": [
                    {"title": "Tailwind CSS Official Documentation", "url": "https://tailwindcss.com/docs", "type": "docs"},
                    {"title": "CSS-Tricks Complete Guide to Grid", "url": "https://css-tricks.com/snippets/css/complete-guide-grid/", "type": "article"}
                ],
                "exercise": "Create a responsive multi-device landing page with animated menus and responsive pricing cards.",
                "hours": 6, "order": 2
            },
            {
                "stage": "Stage 2: Frontend Engineering & State Management",
                "title": "React.js Component Lifecycle, Hooks & State Architecture",
                "desc": "Learn functional React components, useState, useEffect, custom hooks, and clean client-side routing.",
                "resources": [
                    {"title": "React Official Interactive Docs", "url": "https://react.dev", "type": "docs"},
                    {"title": "React Patterns and Best Practices", "url": "https://reactpatterns.com", "type": "article"}
                ],
                "exercise": "Build an eCommerce Product Catalog with category filtering, shopping cart drawer, and debounced search.",
                "hours": 12, "order": 3
            },
            {
                "stage": "Stage 2: Frontend Engineering & State Management",
                "title": "REST API Integration & Authentication Flows",
                "desc": "Integrate JWT-based authorization tokens, interceptors, error boundaries, and optimistic UI updates.",
                "resources": [
                    {"title": "Axios HTTP Client Documentation", "url": "https://axios-http.com/docs/intro", "type": "docs"},
                    {"title": "JWT Auth Security Best Practices", "url": "https://auth0.com/learn/json-web-tokens", "type": "article"}
                ],
                "exercise": "Connect React frontend to an authenticated backend, handling token refresh and session expiry.",
                "hours": 10, "order": 4
            },
            {
                "stage": "Stage 3: Backend Services, Database & Deployment",
                "title": "Relational Database Modeling with PostgreSQL & Django ORM",
                "desc": "Design normalized schemas, foreign key relationships, indexes, query optimization, and migrations.",
                "resources": [
                    {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/", "type": "docs"},
                    {"title": "Django ORM Performance Cookbook", "url": "https://docs.djangoproject.com/en/stable/topics/db/optimization/", "type": "article"}
                ],
                "exercise": "Design a relational schema with multiple related entities, transactions, and custom model managers.",
                "hours": 10, "order": 5
            },
            {
                "stage": "Stage 3: Backend Services, Database & Deployment",
                "title": "Containerization with Docker & Production CI/CD",
                "desc": "Write Dockerfiles, docker-compose orchestration, environment security, and deploy to modern cloud hosting.",
                "resources": [
                    {"title": "Docker Getting Started Guide", "url": "https://docs.docker.com/get-started/", "type": "docs"},
                    {"title": "GitHub Actions CI/CD Pipeline Workflow", "url": "https://docs.github.com/en/actions", "type": "docs"}
                ],
                "exercise": "Dockerize the full-stack web application with separated frontend and backend services.",
                "hours": 8, "order": 6
            }
        ]
    elif "python" in role_slug:
        task_data = [
            {
                "stage": "Stage 1: Python Advanced Idioms & OOP",
                "title": "Advanced Python: OOP, Decorators & Generators",
                "desc": "Master object-oriented design patterns, dunder methods, custom decorators, and memory-efficient iterators.",
                "resources": [
                    {"title": "Real Python Advanced Tutorials", "url": "https://realpython.com/", "type": "article"},
                    {"title": "Python 3 Standard Library Reference", "url": "https://docs.python.org/3/library/", "type": "docs"}
                ],
                "exercise": "Implement a custom caching decorator and an event-driven observer pattern in pure Python.",
                "hours": 8, "order": 1
            },
            {
                "stage": "Stage 2: Web Frameworks & Microservices",
                "title": "Building Scalable RESTful APIs with Django REST Framework",
                "desc": "Create ModelSerializers, ViewSets, custom permissions, rate limiting, and automated Swagger API docs.",
                "resources": [
                    {"title": "Django REST Framework Documentation", "url": "https://www.django-rest-framework.org/", "type": "docs"}
                ],
                "exercise": "Build a multi-tenant REST API with filtering, pagination, and JWT authentication.",
                "hours": 12, "order": 2
            },
            {
                "stage": "Stage 3: Database Optimization & Background Queues",
                "title": "PostgreSQL Optimization, Caching with Redis & Celery",
                "desc": "Solve N+1 query bottlenecks with select_related/prefetch_related, implement Redis caching, and asynchronous task execution.",
                "resources": [
                    {"title": "Redis University - Fast In-Memory Storage", "url": "https://university.redis.com/", "type": "docs"}
                ],
                "exercise": "Implement an asynchronous email and report generation pipeline with background worker queues.",
                "hours": 10, "order": 3
            }
        ]
    elif "data" in role_slug:
        task_data = [
            {
                "stage": "Stage 1: Data Wrangling & Exploratory Analysis",
                "title": "Data Analysis with Pandas, NumPy & Cleaning Pipelines",
                "desc": "Master DataFrame operations, groupby aggregations, handling missing data, and statistical summaries.",
                "resources": [
                    {"title": "Pandas Documentation & Tutorials", "url": "https://pandas.pydata.org/docs/", "type": "docs"},
                    {"title": "Kaggle Exploratory Data Analysis Courses", "url": "https://www.kaggle.com/learn", "type": "video"}
                ],
                "exercise": "Perform comprehensive exploratory data analysis on a real-world messy dataset and present findings.",
                "hours": 10, "order": 1
            },
            {
                "stage": "Stage 2: Advanced SQL for Business Analytics",
                "title": "Complex SQL: Window Functions, CTEs & Aggregations",
                "desc": "Write analytical SQL with ROW_NUMBER, RANK, moving averages, Common Table Expressions, and subqueries.",
                "resources": [
                    {"title": "PostgreSQL Window Functions Guide", "url": "https://www.postgresql.org/docs/current/tutorial-window.html", "type": "docs"}
                ],
                "exercise": "Solve 10 LeetCode/HackerRank hard SQL problems calculating cohort retention and monthly revenue growth.",
                "hours": 8, "order": 2
            },
            {
                "stage": "Stage 3: Interactive Dashboards & Storytelling",
                "title": "Data Visualization & Dashboard Engineering",
                "desc": "Build executive dashboards using Matplotlib, Seaborn, Plotly, or PowerBI to communicate actionable business metrics.",
                "resources": [
                    {"title": "Storytelling with Data Best Practices", "url": "https://www.storytellingwithdata.com/", "type": "article"}
                ],
                "exercise": "Create an end-to-end interactive dashboard displaying key KPI trends with filtering.",
                "hours": 8, "order": 3
            }
        ]
    elif "ai" in role_slug:
        task_data = [
            {
                "stage": "Stage 1: Applied Machine Learning Foundations",
                "title": "Supervised & Unsupervised ML with Scikit-learn",
                "desc": "Learn linear regression, classification, random forests, clustering, cross-validation, and hyperparameter tuning.",
                "resources": [
                    {"title": "Scikit-Learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "docs"}
                ],
                "exercise": "Train and evaluate an ensemble classifier on customer churn data, achieving >85% F1-score.",
                "hours": 12, "order": 1
            },
            {
                "stage": "Stage 2: Deep Learning & NLP Fundamentals",
                "title": "PyTorch Deep Learning & Transformer Architectures",
                "desc": "Understand neural networks, backpropagation, CNNs, transformers, self-attention, and text embeddings.",
                "resources": [
                    {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/", "type": "docs"},
                    {"title": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course/", "type": "docs"}
                ],
                "exercise": "Fine-tune a Hugging Face transformer model for multi-class sentiment analysis and entity extraction.",
                "hours": 14, "order": 2
            },
            {
                "stage": "Stage 3: GenAI, RAG & LLM Application Engineering",
                "title": "Retrieval Augmented Generation (RAG) & Vector Databases",
                "desc": "Build production GenAI applications using vector embeddings, LangChain/LlamaIndex, and prompt engineering.",
                "resources": [
                    {"title": "Pinecone Learning Center on Vector Search", "url": "https://www.pinecone.io/learn/", "type": "article"}
                ],
                "exercise": "Build a Question-Answering system over technical PDF manuals using LangChain and vector search.",
                "hours": 12, "order": 3
            }
        ]
    elif "cyber" in role_slug:
        task_data = [
            {
                "stage": "Stage 1: Networking & Security Protocols",
                "title": "TCP/IP, Network Analysis & Wireshark Packet Inspection",
                "desc": "Understand network layers, DNS, DHCP, SSL/TLS handshakes, and packet analysis with Wireshark.",
                "resources": [
                    {"title": "Wireshark User's Guide", "url": "https://www.wireshark.org/docs/", "type": "docs"}
                ],
                "exercise": "Capture and analyze network traffic to identify insecure protocols and credential transmission.",
                "hours": 8, "order": 1
            },
            {
                "stage": "Stage 2: Web Security & OWASP Top 10",
                "title": "Web Application Penetration Testing & Vulnerability Remediation",
                "desc": "Identify and patch SQL Injection, Cross-Site Scripting (XSS), CSRF, Broken Auth, and SSRF vulnerabilities.",
                "resources": [
                    {"title": "OWASP Top 10 Security Risks", "url": "https://owasp.org/www-project-top-ten/", "type": "article"}
                ],
                "exercise": "Complete PortSwigger Web Security Academy labs on SQLi and XSS exploitation and mitigation.",
                "hours": 12, "order": 2
            },
            {
                "stage": "Stage 3: SOC Operations & Incident Response",
                "title": "SIEM Log Analysis & Incident Response Frameworks",
                "desc": "Monitor security event logs, analyze brute force attempts, and configure automated alert triggers.",
                "resources": [
                    {"title": "NIST Incident Handling Guide (SP 800-61)", "url": "https://csrc.nist.gov/", "type": "docs"}
                ],
                "exercise": "Configure a Splunk or Elastic SIEM instance to detect simulated SSH and web attack spikes.",
                "hours": 10, "order": 3
            }
        ]
    else:  # Cloud Engineer or Default
        task_data = [
            {
                "stage": "Stage 1: Linux Administration & Cloud Foundations",
                "title": "Linux Systems Administration & Shell Automation",
                "desc": "Master permissions, systemd services, SSH key auth, firewall setup (UFW/iptables), and bash scripting.",
                "resources": [
                    {"title": "Linux Journey - Comprehensive Guide", "url": "https://linuxjourney.com/", "type": "article"}
                ],
                "exercise": "Write a bash automation script that sets up a hardened Linux server with fail2ban and auto-updates.",
                "hours": 8, "order": 1
            },
            {
                "stage": "Stage 2: Infrastructure as Code & Cloud Services",
                "title": "AWS / GCP Core Services & Terraform Provisioning",
                "desc": "Provision VPCs, subnets, EC2 instances, S3 buckets, IAM least-privilege policies, and RDS via Terraform.",
                "resources": [
                    {"title": "Terraform HashiCorp Tutorials", "url": "https://developer.hashicorp.com/terraform/tutorials", "type": "docs"}
                ],
                "exercise": "Write modular Terraform code to provision a multi-tier high-availability web architecture.",
                "hours": 12, "order": 2
            },
            {
                "stage": "Stage 3: Container Orchestration & Monitoring",
                "title": "Kubernetes Cluster Management & Observability",
                "desc": "Deploy containerized applications with Kubernetes Deployments, Services, Ingress, Prometheus, and Grafana.",
                "resources": [
                    {"title": "Kubernetes Official Documentation", "url": "https://kubernetes.io/docs/home/", "type": "docs"}
                ],
                "exercise": "Deploy a multi-replica web service on Minikube with health checks and Prometheus metrics.",
                "hours": 12, "order": 3
            }
        ]

    # Bulk create tasks
    for item in task_data:
        RoadmapTask.objects.create(
            roadmap=roadmap,
            stage_name=item["stage"],
            title=item["title"],
            description=item["desc"],
            resources=item["resources"],
            exercise=item["exercise"],
            estimated_hours=item["hours"],
            order=item["order"],
            is_completed=False
        )

    roadmap.update_progress()
    return roadmap
