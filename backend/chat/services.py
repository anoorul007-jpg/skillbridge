"""
AI Career Mentor Service
Provides intelligent career guidance, interview preparation, portfolio tips,
and skill acquisition strategies. Uses Google Gemini API if configured,
with an intelligent offline expert rule engine as a resilient fallback.
"""

import requests
import json
from django.conf import settings
from careers.models import CareerRole, SkillAnalysis, StudentSkill
from accounts.models import StudentProfile

SYSTEM_PROMPT = """You are SkillBridge AI, a world-class senior career advisor and technical mentor for engineering students and job seekers.
Your advice is encouraging, realistic, pragmatic, and directly actionable.
Topics you excel in:
1. Choosing tech career tracks (Full Stack, Data Analyst, AI/ML, Cloud, Cybersecurity, Python Developer).
2. Bridging skill gaps and structuring daily learning routines.
3. Resume polishing, GitHub portfolio presentation, and impactful project creation.
4. Technical interview preparation (coding rounds, system design basics, behavioral STAR method).
5. Securing internships and landing entry-level job offers.

Guidelines:
- Keep your answers structured with bullet points, numbered steps, or code tips where appropriate.
- Never guarantee a job or salary; focus on building verifiable competencies.
- Tailor your suggestions to modern 2026 tech industry demands.
"""

def generate_ai_career_response(user, user_prompt: str) -> dict:
    """
    Generates a mentor reply using Gemini API if key is available,
    otherwise uses an intelligent, context-aware expert advisory engine.
    """
    # 1. Gather context about the student
    context_info = []
    try:
        profile = getattr(user, 'student_profile', None)
        if profile and profile.target_role_id:
            role = CareerRole.objects.filter(id=profile.target_role_id).first()
            if role:
                context_info.append(f"Target Career: {role.title}")
        
        # User skills
        user_skills = list(StudentSkill.objects.filter(user=user).values_list('skill__name', flat=True))
        if user_skills:
            context_info.append(f"Acquired Skills: {', '.join(user_skills[:6])}")
        
        # Recent analysis
        analysis = SkillAnalysis.objects.filter(user=user).order_by('-created_at').first()
        if analysis:
            context_info.append(f"Current Career Readiness Score: {analysis.readiness_score}%")
            if analysis.missing_skills:
                missing = [s.get('name', '') for s in analysis.missing_skills[:3]]
                context_info.append(f"Immediate Skill Gaps: {', '.join(missing)}")
    except Exception:
        pass

    context_str = " | ".join(context_info) if context_info else "Student exploring tech careers"

    # 2. Try calling Gemini API if key is present
    api_key = getattr(settings, 'GEMINI_API_KEY', '') or ''
    if api_key and api_key.strip():
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{SYSTEM_PROMPT}\nStudent Context: {context_str}\n\nStudent Question: {user_prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 800
                }
            }
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                reply_text = data['candidates'][0]['content']['parts'][0]['text']
                return {
                    "text": reply_text,
                    "source": "AI_API",
                    "actions": extract_suggested_actions(user_prompt)
                }
        except Exception:
            # Gracefully drop through to the robust fallback
            pass

    # 3. Intelligent Fallback Mentor Engine
    return generate_fallback_mentor_response(user_prompt, context_str)


def generate_fallback_mentor_response(prompt: str, context: str) -> dict:
    """
    Intelligent knowledge-base providing high-value technical mentorship
    when the external AI API is offline or without an API key.
    """
    prompt_lower = prompt.lower()

    if any(k in prompt_lower for k in ["resume", "cv", "ats", "portfolio"]):
        text = (
            "Here is how to optimize your technical resume for high-callback rates:\n\n"
            "1. **Use the XYZ Action Formula**: Write bullet points as: *'Accomplished [X], as measured by [Y], by doing [Z]'*. "
            "For example: *'Engineered a RESTful microservice handling 5,000 req/min with Django and Redis, reducing latency by 35%'*.\n"
            "2. **Feature Verifiable Projects**: Include 2-3 production-quality applications with live deployment links and GitHub repositories with clean READMEs.\n"
            "3. **Targeted Technical Skills Section**: Group skills clearly into Languages, Frameworks, Databases, and Tools rather than a giant unreadable block.\n"
            "4. **Pass ATS Filters**: Use single-column formatting, avoid multi-column tables or icons for critical text, and ensure skills match job descriptions.\n\n"
            "💡 *Tip: Head over to our Resume Analyzer tab to upload and scan your resume against industry benchmarks!*"
        )
        actions = ["Upload Resume", "Review Skill Gap", "Explore Projects"]

    elif any(k in prompt_lower for k in ["interview", "prep", "coding round", "behavioral"]):
        text = (
            "Here is your 4-pillar technical interview preparation roadmap:\n\n"
            "1. **Core Data Structures & Algorithms**: Focus on Arrays, Hash Maps, Two Pointers, Sliding Window, Trees, and BFS/DFS. Solve 50-75 LeetCode medium questions.\n"
            "2. **Explain Your Thought Process**: In technical interviews, interviewers evaluate communication as much as code. Always speak your thought process before writing a single line.\n"
            "3. **System Design & API Fundamentals**: For entry-level and junior roles, understand HTTP methods, status codes, REST conventions, database indexing, and caching.\n"
            "4. **Behavioral STAR Technique**: Prepare stories for Situation, Task, Action, Result covering conflict resolution, technical hurdles, and team collaboration.\n\n"
            "🎯 *Try taking our Technical Assessments (Python, SQL, JavaScript) to benchmark your quiz skills!*"
        )
        actions = ["Take Technical Assessment", "View Learning Roadmap", "Practice SQL"]

    elif any(k in prompt_lower for k in ["full stack", "frontend", "backend", "web development"]):
        text = (
            "To excel as a Modern Full Stack Developer in 2026, here is the recommended tech stack and progression:\n\n"
            "• **Frontend**: Master modern React (Hooks, Context, State), Tailwind CSS for responsive styling, and TypeScript.\n"
            "• **Backend**: Strong foundations in Python (Django / FastAPI) or Node.js (Express), implementing clean RESTful endpoints and JWT authentication.\n"
            "• **Database**: Deep understanding of PostgreSQL (relationships, indexes, joins) and Redis for in-memory caching.\n"
            "• **DevOps / Deployment**: Containerize with Docker, use GitHub Actions for automated CI/CD, and deploy on modern platforms like Render, Railway, or AWS.\n\n"
            "Check our **Learning Roadmap** to see detailed week-by-week stages for Full Stack development!"
        )
        actions = ["View Full Stack Roadmap", "Explore Full Stack Projects", "Take JavaScript Assessment"]

    elif any(k in prompt_lower for k in ["data analyst", "data science", "sql", "pandas", "bi"]):
        text = (
            "Breaking into Data Analytics requires 3 high-impact competencies:\n\n"
            "1. **SQL Mastery**: You must be fluent in Window Functions (`ROW_NUMBER()`, `RANK()`), CTEs, Aggregations, and complex JOINs.\n"
            "2. **Python for Data Wrangling**: Proficiency with Pandas, NumPy, and cleaning unstructured/messy CSV datasets.\n"
            "3. **Visual Storytelling**: Translating raw data into business insights using interactive dashboards (Tableau, Power BI, or Streamlit).\n\n"
            "💼 *Portfolio Tip*: Build a case study analyzing real-world public data (e.g. Kaggle sales or mobility data) with a documented executive summary."
        )
        actions = ["View Data Analyst Roadmap", "Take SQL Assessment", "View Project Recommendations"]

    elif any(k in prompt_lower for k in ["ai", "machine learning", "ml", "deep learning", "genai", "nlp"]):
        text = (
            "The AI Engineering landscape has evolved rapidly. Here is the modern learning hierarchy:\n\n"
            "1. **Foundations**: Solid grasp of linear algebra, calculus, and Python numerical libraries (NumPy, Scikit-learn).\n"
            "2. **Deep Learning & PyTorch**: Understanding feed-forward networks, CNNs, and Transformer self-attention mechanisms.\n"
            "3. **GenAI & RAG Applications**: Building production applications using LLM APIs, LangChain, vector databases (Pinecone, Chroma), and prompt engineering.\n"
            "4. **Deployment**: Serving models with FastAPI or Triton, tracking experiments with MLflow, and monitoring latency."
        )
        actions = ["View AI Engineer Roadmap", "Take Python Assessment", "Explore AI Projects"]

    elif any(k in prompt_lower for k in ["project", "build", "portfolio", "capstone"]):
        text = (
            "To build projects that stand out to hiring managers and recruiters:\n\n"
            "• **Avoid generic tutorial clones**: Instead of a generic to-do app or standard weather app, build domain-specific tools (e.g., an automated invoice auditor, an AI study planner, or a micro-SaaS dashboard).\n"
            "• **Include Full Authentication & Security**: Implement JWT auth, role-based permissions, and input validation.\n"
            "• **Deploy to Live Production**: Provide a functional demo link with sample login credentials directly in the README.\n"
            "• **Write a Stellar README**: Include an architecture diagram, tech stack badges, API documentation, and setup instructions."
        )
        actions = ["View Recommended Projects", "Explore Career Roles", "Schedule Mentor Session"]

    elif any(k in prompt_lower for k in ["internship", "job", "apply", "hire", "fresher"]):
        text = (
            "Here is the proven strategy for landing your first tech internship or job:\n\n"
            "1. **Quality over Quantity**: Tailor 5 targeted applications per week with custom notes rather than sending 100 blind generic clicks.\n"
            "2. **Skill Alignment**: Ensure your resume highlights at least 70% of the skills required in the job listing.\n"
            "3. **Network on LinkedIn**: Reach out to engineering team leads or alumni with a polite 3-sentence note highlighting how your projects align with their tech stack.\n"
            "4. **Leverage the Job Portal**: Explore our **Internship & Job Portal** where jobs are ranked with real-time skill matching scores based on your profile!"
        )
        actions = ["Browse Matching Jobs", "View Application Tracker", "Analyze Skill Gap"]

    else:
        text = (
            f"Hello! I am your SkillBridge AI Career Mentor. Based on your profile ({context}), "
            "I'm here to help you accelerate your technical career.\n\n"
            "Here are some great questions to get started:\n"
            "• *'What projects should I build to become a Full Stack Developer?'*\n"
            "• *'How do I prepare for a Python or SQL technical interview?'*\n"
            "• *'What are the most in-demand skills for AI Engineers in 2026?'*\n"
            "• *'How can I improve my resume to get more interview callbacks?'*\n\n"
            "What would you like to explore today?"
        )
        actions = ["Analyze My Resume", "Explore Career Roles", "Take Assessment", "View Jobs"]

    return {
        "text": text,
        "source": "AI_FALLBACK_ENGINE",
        "actions": actions
    }


def extract_suggested_actions(prompt: str) -> list:
    """Extracts helpful contextual action pills from user query."""
    p = prompt.lower()
    if "resume" in p:
        return ["Upload Resume", "Review Skill Gap"]
    if "interview" in p or "test" in p:
        return ["Take Technical Assessment", "View Learning Roadmap"]
    if "project" in p:
        return ["View Recommended Projects", "Explore Roles"]
    if "job" in p or "intern" in p:
        return ["Browse Matching Jobs", "Track Applications"]
    return ["Explore Career Roles", "Take Assessment", "View Roadmap"]
