# SkillBridge – AI-Powered Skill Development & Career Guidance Platform

> **A real-world, production-ready, full-stack web platform bridging the gap between college education and modern high-demand tech careers.**

---

## 🌟 Project Overview

**SkillBridge** is a comprehensive, full-stack career development platform engineered for college students, graduates, and job seekers. The platform enables users to identify their existing technical skills via automated PDF/DOCX resume parsing, inspect mathematical skill gaps against standardized industry career roles, follow personalized multi-stage learning roadmaps, practice verified technical assessments, chat with a 24/7 AI career mentor, and match with internships and entry-level opportunities ranked by verified skill compatibility.

---

## 🚀 Key Features

### 🎓 1. Student Features
- **Multi-Role Authentication**: Secure registration, JWT access/refresh tokens, email verification mock, and password recovery.
- **Student Profile**: Academic background (college, degree, graduation year), target career track, personal bio, GitHub/LinkedIn links, and technical skills portfolio.
- **AI Resume Analyzer**: Upload PDF or DOCX resumes; extracts candidate metadata, technical skills, education, projects, and certifications using **PyMuPDF** and NLP technical ontology. Displays extracted data for student review and confirmation before syncing.
- **Career Pathways Selection**: 6 high-demand tracks:
  - *Full Stack Developer*
  - *Python Developer*
  - *Data Analyst*
  - *AI Engineer*
  - *Cybersecurity Analyst*
  - *Cloud Engineer*
- **Transparent Skill Gap Analysis**:
  - Compares student's verified skills against required competencies.
  - Transparent formula: `Readiness Score (%) = (Matched Weights / Total Required Weights) × 100`.
  - Visual competency breakdown, matched skills list with student proficiency, and prioritized missing skills list.
  - Clear disclaimer: indicative learning benchmark, not a guaranteed employment claim.
- **Personalized Learning Roadmaps**:
  - Automatically customized to target missing skills across 3 logical stages (*Stage 1: Core Fundamentals*, *Stage 2: Framework Mastery*, *Stage 3: Real-World Architecture*).
  - Hands-on exercises and curated external documentation links (MDN, Official Docs, Interactive Guides).
  - Interactive milestone checkboxes that update completion percentage and trigger celebratory confetti.
- **Practical Project Bank**: Industry-grade project blueprints (Beginner, Intermediate, Advanced) with full tech stacks, core deliverables, and step-by-step implementation guides.
- **Technical Assessments**: Timed interactive assessments for **Python**, **SQL**, **JavaScript**, **HTML5**, and **CSS3**. Real-time countdown timer, code snippet boxes, instant scoring, question-by-question educational breakdown, and automatic skill verification upon passing.
- **AI Career Mentor Chatbot**: 24/7 contextual guidance on interview preparation, portfolio building, and career transitions with quick starter prompts, rich markdown responses, and action buttons.
- **Internship & Job Portal**: Listings with live **"Skill Match %"** badges calculated dynamically against the logged-in student's skills, bookmarking, and quick application submission.
- **Application Tracking**: Pipeline tracker of submitted applications with interview dates and personal preparation notes.

### 💼 2. Mentor Features
- **Mentor Registration & Profile**: Company, designation, years of experience, and areas of expertise.
- **Assigned Student Roster**: View assigned mentees with their real-time Career Readiness scores, college, roadmap completion rates, and test counts.
- **1-on-1 Session Scheduling**: Schedule video mentorship sessions with Google Meet links, agendas, and durations.
- **Evaluation & Feedback**: Submit constructive evaluations, rating (1-5 stars), and targeted project improvement advice.

### 🛡️ 3. Administrator Features
- **Platform Analytics**: Total users, students, mentors, jobs posted, applications, test completion statistics, and average student readiness score.
- **Track Enrollment Analytics**: Visual distribution of students enrolled across each career role.
- **User Directory Moderation**: Manage user accounts, role permissions, and active/inactive status toggles.
- **Content Moderation**: Review job postings and career tracks.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React Icons, Recharts, Canvas-Confetti, Axios |
| **Backend** | Python 3.12, Django 6.1, Django REST Framework, SimpleJWT (JWT Authentication), Django-CORS-Headers |
| **Database** | PostgreSQL (Production-ready with automated fallback to SQLite for zero-friction setup) |
| **Resume & NLP** | PyMuPDF (fitz) for PDF text extraction, python-docx for DOCX files, NLP regex heuristics & technical ontology |
| **AI Integration** | Google Gemini API integration with intelligent, context-aware expert rules fallback engine |

---

## 📂 Project Structure

```
skillbridge/
├── backend/                             # Django Backend Project
│   ├── manage.py
│   ├── .env                             # Environment variables
│   ├── .env.example
│   ├── skillbridge_backend/             # Project settings & URL routing
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/                        # Custom User, Roles, Student & Mentor Profiles
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── management/commands/seed_data.py
│   ├── resumes/                         # File uploads, PyMuPDF & docx parser, NLP extraction
│   │   ├── models.py
│   │   ├── parser.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── careers/                         # Roles, Skills, Gap Analysis, Roadmaps, Projects
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── assessments/                     # Quizzes for Python, SQL, JS, HTML, CSS, timers & grading
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── mentorship/                      # Mentor assignments, sessions, feedback
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── jobs/                            # Job listings, real-time skill matching, applications
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── chat/                            # AI Career Mentor service & chat sessions
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── serializers.py
│   │   └── views.py
│   └── analytics/                       # Platform metrics, notifications, activity logs
│       ├── models.py
│       ├── serializers.py
│       └── views.py
├── frontend/                            # React Vite Frontend Application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                      # Full 20-Page Router
│   │   ├── index.css                    # Tailwind CSS v4 setup
│   │   ├── api/
│   │   │   └── client.js                # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Auth state, login, register, 1-click demo switcher
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx           # Header, notifications dropdown, demo switcher
│   │   │   │   ├── Sidebar.jsx          # Professional Navy Blue navigation sidebar
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── AppLayout.jsx
│   │   │   └── common/
│   │   │       └── ProtectedRoute.jsx
│   │   └── pages/                       # 20 Complete Application Pages
│   │       ├── LandingPage.jsx
│   │       ├── AboutPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── ForgotPasswordPage.jsx
│   │       ├── StudentDashboard.jsx
│   │       ├── StudentProfilePage.jsx
│   │       ├── ResumeAnalyzerPage.jsx
│   │       ├── CareerSelectionPage.jsx
│   │       ├── SkillGapAnalysisPage.jsx
│   │       ├── LearningRoadmapPage.jsx
│   │       ├── ProjectRecommendationsPage.jsx
│   │       ├── TechnicalAssessmentsPage.jsx
│   │       ├── AssessmentRunnerPage.jsx
│   │       ├── AICareerMentorPage.jsx
│   │       ├── JobPortalPage.jsx
│   │       ├── ApplicationTrackingPage.jsx
│   │       ├── MentorDashboardPage.jsx
│   │       ├── AdminDashboardPage.jsx
│   │       ├── NotificationsPage.jsx
│   │       └── SettingsPage.jsx
├── sample_resume_priya_sharma.pdf       # Test resume for evaluating resume parser
└── README.md
```

---

## 🔑 Demonstration Accounts & Credentials

The application includes an automated seeder that sets up realistic data across all modules. You can log in manually or use the **1-Click Demo Buttons** on the Login Page:

| Role | Email | Password | Description |
|---|---|---|---|
| **🎓 Student** | `student@skillbridge.edu` | `StudentPass123!` | Priya Sharma (NIT CSE student, Full Stack track, active roadmap, verified skills) |
| **💼 Mentor** | `mentor.alex@skillbridge.edu` | `MentorPass123!` | Alex Rivera (Staff Architect at Stripe / TechCorp, assigned mentees & sessions) |
| **🛡️ Admin** | `admin@skillbridge.edu` | `AdminPass123!` | System Administrator (Full platform telemetry & user moderation) |

---

## ⚙️ Installation & Execution Instructions

### 1. Prerequisites
- **Python 3.11+** installed (`python --version`)
- **Node.js 18+** & **npm** installed (`node --version`, `npm --version`)
- *(Optional)* **PostgreSQL** (application automatically defaults to SQLite if PostgreSQL credentials are not provided in `.env`)

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment**:
   - On Windows:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers PyMuPDF python-docx requests python-dotenv
   ```

4. **Configure Database & Secrets**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional: If connecting to PostgreSQL, specify `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` in `.env`)*

5. **Run Database Migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Seed Initial Demonstration Data**:
   ```bash
   python manage.py seed_data
   ```

7. **Start the Django Development Server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   *The backend REST API will be live at `http://localhost:8000/api/`*

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend packages**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   *The React application will be live at `http://localhost:5173/`*

---

## 🧪 Testing the Application

### Automated Backend Tests
Run the Django test suite verifying calculations, permissions, and models:
```bash
cd backend
python manage.py test careers
```

### End-to-End Walkthrough
1. **Explore Landing Page**: Open `http://localhost:5173/` to review platform features, statistics, and career tracks.
2. **Instant Login**: Click **Log In** and select **"Student"** using the 1-click demo button.
3. **Student Dashboard**: Inspect your **Career Readiness Score**, roadmap progress, matched vs. missing skills, and top matched jobs.
4. **AI Resume Analyzer**: Navigate to `/resume-analyzer`, drag and drop `sample_resume_priya_sharma.pdf`, review detected skills, and click **"Confirm & Sync Skills"**.
5. **Skill Gap Analysis**: Navigate to `/skill-gap` to see the mathematical formula breakdown `(Matched / Total) * 100` and radar view.
6. **Interactive Roadmap**: Check off milestone tasks on `/roadmap` to see real-time progress bar recalculations.
7. **Take an Assessment**: Go to `/assessments`, start the **Python Core & Logic Mastery** quiz, answer questions, and submit to view educational explanations and earn verified badges.
8. **Chat with AI Mentor**: Open `/ai-mentor`, ask technical questions or click starter prompt chips, and follow suggested action links.
9. **Job Portal & Applications**: Browse `/jobs`, observe real-time skill matching percentages for each posting, bookmark roles, submit an application, and track it in `/applications`.
10. **Mentor Hub**: Use the top role switcher to toggle to **"Mentor"** (`mentor.alex@skillbridge.edu`). Inspect assigned students, schedule a 1-on-1 meeting, and submit feedback.
11. **Admin Hub**: Switch to **"Admin"** (`admin@skillbridge.edu`) to view platform analytics, career enrollment charts, and user account controls.

---

## 🔒 Security & Privacy Practices

- **Password Security**: Passwords hashed using PBKDF2 with SHA-256 algorithm.
- **Stateless Authorization**: Short-lived JWT access tokens with rotating refresh tokens via `djangorestframework-simplejwt`.
- **Upload Validation**: Restricts resume uploads strictly to `.pdf` and `.docx` formats with a 5MB size limit.
- **Private File Storage**: Resumes are segmented per user under isolated paths (`media/resumes/user_<id>/`).
- **Input Validation**: All incoming requests validated via DRF serializers to prevent SQL injection and malformed inputs.
- **Ethical AI Commitment**: The platform never fabricates achievements or guarantees employment. All resume parsing outputs require explicit student confirmation.

---

## 📄 License & Attribution

Developed for academic major project presentation and portfolio demonstration. Built with passion for student technical empowerment.
