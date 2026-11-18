/**
 * SkillBridge Demo Resilient Fallback Interceptor
 * If the deployed frontend on Vercel is accessed without an active backend URL,
 * this interceptor seamlessly serves real mock data so the app functions 100%
 * smoothly without Network Errors during demonstrations!
 */

export const getMockResponse = (config) => {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // 1. Auth Login
  if (url.includes('/auth/login') && method === 'post') {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}); } catch(e) {}
    const email = body.email || 'student@skillbridge.edu';
    const role = email.includes('admin') ? 'ADMIN' : email.includes('mentor') ? 'MENTOR' : 'STUDENT';

    return {
      status: 200,
      data: {
        tokens: { access: 'demo-jwt-token-xyz', refresh: 'demo-refresh-token-xyz' },
        user: {
          id: 1,
          email: email,
          username: email.split('@')[0],
          first_name: role === 'ADMIN' ? 'System' : role === 'MENTOR' ? 'Alex' : 'Priya',
          last_name: role === 'ADMIN' ? 'Admin' : role === 'MENTOR' ? 'Rivera' : 'Sharma',
          role: role,
          is_verified: true,
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          student_profile: {
            college_name: 'National Institute of Technology',
            degree: 'B.Tech Computer Science',
            target_role_id: 1,
            target_role_title: 'Full Stack Developer',
            readiness_score: 80.0
          }
        }
      }
    };
  }

  // 2. Auth Current User
  if (url.includes('/auth/me')) {
    return {
      status: 200,
      data: {
        id: 1,
        email: 'student@skillbridge.edu',
        username: 'student_user',
        first_name: 'Priya',
        last_name: 'Sharma',
        role: 'STUDENT',
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        student_profile: {
          college_name: 'National Institute of Technology',
          degree: 'B.Tech Computer Science',
          target_role_id: 1,
          target_role_title: 'Full Stack Developer',
          readiness_score: 80.0
        }
      }
    };
  }

  // 3. Career Roles
  if (url.includes('/careers/roles')) {
    return {
      status: 200,
      data: [
        {
          id: 1,
          title: "Full Stack Developer",
          slug: "full-stack-developer",
          description: "Architects, engineers, and maintains both client-facing responsive interfaces and resilient backend API microservices.",
          demand_level: "Extremely High Demand",
          avg_salary_range: "$85,000 - $135,000 / yr",
          icon: "Layers",
          required_skills: [
            { id: 1, skill_name: "React.js", weight: 5, category: "Framework" },
            { id: 2, skill_name: "Python", weight: 4, category: "Language" },
            { id: 3, skill_name: "Django", weight: 4, category: "Framework" },
            { id: 4, skill_name: "JavaScript", weight: 5, category: "Language" },
            { id: 5, skill_name: "PostgreSQL", weight: 4, category: "Database" },
            { id: 6, skill_name: "Docker", weight: 3, category: "DevOps" }
          ]
        },
        {
          id: 2,
          title: "Python Developer",
          slug: "python-developer",
          description: "Specializes in building high-throughput backend services, automation pipelines, REST APIs, and database integrations.",
          demand_level: "High Demand",
          avg_salary_range: "$80,000 - $125,000 / yr",
          icon: "Code",
          required_skills: [
            { id: 7, skill_name: "Python", weight: 5, category: "Language" },
            { id: 8, skill_name: "Django", weight: 5, category: "Framework" },
            { id: 9, skill_name: "FastAPI", weight: 4, category: "Framework" },
            { id: 10, skill_name: "Redis", weight: 3, category: "Database" }
          ]
        },
        {
          id: 3,
          title: "Data Analyst",
          slug: "data-analyst",
          description: "Transforms raw transactional data into actionable business intelligence, dashboards, and growth insights.",
          demand_level: "High Demand",
          avg_salary_range: "$70,000 - $110,000 / yr",
          icon: "BarChart3",
          required_skills: [
            { id: 11, skill_name: "SQL", weight: 5, category: "Language" },
            { id: 12, skill_name: "Pandas", weight: 5, category: "Data/AI" },
            { id: 13, skill_name: "Power BI", weight: 4, category: "Tools" }
          ]
        },
        {
          id: 4,
          title: "AI Engineer",
          slug: "ai-engineer",
          description: "Designs, trains, fine-tunes, and deploys intelligent machine learning models, GenAI agents, and deep learning pipelines.",
          demand_level: "Extremely High Demand",
          avg_salary_range: "$110,000 - $170,000 / yr",
          icon: "Cpu",
          required_skills: [
            { id: 14, skill_name: "PyTorch", weight: 5, category: "Data/AI" },
            { id: 15, skill_name: "Machine Learning", weight: 5, category: "Data/AI" },
            { id: 16, skill_name: "Deep Learning", weight: 5, category: "Data/AI" }
          ]
        },
        {
          id: 5,
          title: "Cybersecurity Analyst",
          slug: "cybersecurity-analyst",
          description: "Monitors network traffic, evaluates application security posture, detects vulnerabilities, and defends infrastructure.",
          demand_level: "High Demand",
          avg_salary_range: "$80,000 - $130,000 / yr",
          icon: "ShieldCheck",
          required_skills: [
            { id: 17, skill_name: "Network Security", weight: 5, category: "Cybersecurity" },
            { id: 18, skill_name: "OWASP", weight: 5, category: "Cybersecurity" }
          ]
        },
        {
          id: 6,
          title: "Cloud Engineer",
          slug: "cloud-engineer",
          description: "Architects, provisions, and automates resilient cloud infrastructure, microservices, and CI/CD pipelines.",
          demand_level: "Very High Demand",
          avg_salary_range: "$90,000 - $145,000 / yr",
          icon: "Cloud",
          required_skills: [
            { id: 19, skill_name: "AWS", weight: 5, category: "Cloud" },
            { id: 20, skill_name: "Docker", weight: 5, category: "DevOps" },
            { id: 21, skill_name: "Kubernetes", weight: 4, category: "DevOps" }
          ]
        }
      ]
    };
  }

  // 4. Skill Gap Analysis
  if (url.includes('/careers/analysis')) {
    return {
      status: 200,
      data: {
        career_role_title: "Full Stack Developer",
        career_role_icon: "Layers",
        readiness_score: 80.0,
        matched_weight: 20,
        total_required_weight: 25,
        matched_skills: [
          { name: "JavaScript", category: "Language", weight: 5, proficiency: "INTERMEDIATE" },
          { name: "React.js", category: "Framework", weight: 5, proficiency: "ADVANCED" },
          { name: "Python", category: "Language", weight: 4, proficiency: "INTERMEDIATE" },
          { name: "HTML5", category: "Language", weight: 3, proficiency: "ADVANCED" },
          { name: "CSS3", category: "Language", weight: 3, proficiency: "INTERMEDIATE" }
        ],
        missing_skills: [
          { name: "Docker", category: "DevOps", weight: 3, importance_note: "Containerization workflows" },
          { name: "Redis", category: "Database", weight: 2, importance_note: "In-memory caching and session queues" }
        ],
        recommendation_summary: "Exceptional alignment! You possess 5 of 7 key competencies for Full Stack Developer. Tackling Docker containerization and Redis caching will make you highly competitive for entry-level roles."
      }
    };
  }

  // 5. Learning Roadmap
  if (url.includes('/careers/roadmap')) {
    return {
      status: 200,
      data: {
        career_role_title: "Full Stack Developer",
        title: "Full Stack Developer Mastery Roadmap",
        estimated_weeks: 12,
        progress_percentage: 50.0,
        total_tasks: 4,
        completed_tasks: 2,
        tasks: [
          {
            id: 1,
            stage_name: "Stage 1: Core Web Fundamentals",
            title: "Modern JavaScript (ES6+) & DOM Architecture",
            description: "Master async/await, closures, array methods, fetch API, and responsive modern layout fundamentals.",
            exercise: "Build an interactive DOM-based Task & Habit Tracker with local storage persistence and dark mode.",
            estimated_hours: 8,
            is_completed: true,
            resources: [{ title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }]
          },
          {
            id: 2,
            stage_name: "Stage 1: Core Web Fundamentals",
            title: "Responsive Layouts with Tailwind CSS & CSS Grid",
            description: "Design fluid, mobile-first responsive interfaces using modern CSS Flexbox, Grid, and utility classes.",
            exercise: "Create a responsive multi-device landing page with animated menus.",
            estimated_hours: 6,
            is_completed: true,
            resources: [{ title: "Tailwind CSS Documentation", url: "https://tailwindcss.com/docs" }]
          },
          {
            id: 3,
            stage_name: "Stage 2: Frontend Engineering & State",
            title: "React.js Hooks, Context & State Management",
            description: "Learn functional React components, useState, useEffect, custom hooks, and client-side routing.",
            exercise: "Build an eCommerce Product Catalog with category filtering and cart drawer.",
            estimated_hours: 12,
            is_completed: false,
            resources: [{ title: "React Official Docs", url: "https://react.dev" }]
          },
          {
            id: 4,
            stage_name: "Stage 3: Backend Services & Deployment",
            title: "Docker Containerization & Production CI/CD",
            description: "Write Dockerfiles, docker-compose orchestration, environment security, and deploy to modern cloud hosting.",
            exercise: "Dockerize a full-stack application with separated services.",
            estimated_hours: 8,
            is_completed: false,
            resources: [{ title: "Docker Getting Started", url: "https://docs.docker.com/get-started/" }]
          }
        ]
      }
    };
  }

  // 6. Projects
  if (url.includes('/careers/projects')) {
    return {
      status: 200,
      data: [
        {
          id: 1,
          title: "SkillBridge Career & Analytics Hub",
          difficulty: "INTERMEDIATE",
          career_role_title: "Full Stack Developer",
          estimated_hours: 30,
          description: "A production-grade full-stack platform featuring JWT role-based authentication, resume NLP extraction, real-time skill matching algorithms, and automated roadmap tracking.",
          technologies: ["React.js", "Django", "PostgreSQL", "Tailwind CSS", "Docker"],
          features: [
            "Multi-role user authentication (Student, Mentor, Admin)",
            "PDF & DOCX parsing using PyMuPDF and python-docx",
            "Transparent career readiness scoring algorithm"
          ],
          implementation_steps: [
            "Set up normalized PostgreSQL models with foreign key constraints",
            "Implement Django REST Framework API endpoints with JWT authentication",
            "Build resume parsing engine using PyMuPDF and technical skills dictionary"
          ],
          github_starter_url: "https://github.com/anoorul007-jpg/skillbridge"
        },
        {
          id: 2,
          title: "FastAPI Distributed Web Scraper & Alert Engine",
          difficulty: "INTERMEDIATE",
          career_role_title: "Python Developer",
          estimated_hours: 20,
          description: "Asynchronous high-concurrency web scraping system monitoring product prices with threshold alerts.",
          technologies: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
          features: [
            "Asynchronous requests handling 200+ concurrent targets",
            "PostgreSQL time-series price history tracking"
          ],
          implementation_steps: [
            "Set up async database connection pools",
            "Implement Celery/Redis worker queues"
          ],
          github_starter_url: "https://github.com/anoorul007-jpg/skillbridge"
        }
      ]
    };
  }

  // 7. Assessments
  if (url.includes('/assessments')) {
    return {
      status: 200,
      data: [
        {
          id: 1,
          title: "Python Core & Logic Mastery",
          category: "Python",
          difficulty: "INTERMEDIATE",
          description: "Test your knowledge of Python 3 data structures, OOP principles, closures, decorators, and memory handling.",
          time_limit_minutes: 15,
          passing_percentage: 70,
          questions_count: 5,
          questions: [
            {
              id: 1,
              question_text: "What is the primary difference between a Python generator and a standard function returning a list?",
              code_snippet: "",
              options: [
                { id: "A", text: "Generators only yield numbers" },
                { id: "B", text: "Generators produce items lazily on demand using 'yield', conserving memory" },
                { id: "C", text: "Generators run in a separate OS thread" },
                { id: "D", text: "Generators do not support for loops" }
              ],
              order: 1
            }
          ]
        },
        {
          id: 2,
          title: "SQL & Relational Database Queries",
          category: "SQL",
          difficulty: "INTERMEDIATE",
          description: "Assess your expertise in relational SQL queries, joins, window functions, indexes, and aggregation.",
          time_limit_minutes: 15,
          passing_percentage: 70,
          questions_count: 5,
          questions: []
        },
        {
          id: 3,
          title: "Modern JavaScript & Async Programming",
          category: "JavaScript",
          difficulty: "INTERMEDIATE",
          description: "Evaluate your mastery of ES6+, event loop execution, closures, Promises, and prototype mechanics.",
          time_limit_minutes: 15,
          passing_percentage: 70,
          questions_count: 5,
          questions: []
        }
      ]
    };
  }

  // 8. Jobs
  if (url.includes('/jobs')) {
    return {
      status: 200,
      data: [
        {
          id: 1,
          title: "Junior Full Stack Developer Intern",
          company_name: "NextWave Innovations",
          job_type_display: "Internship",
          experience_level_display: "Student / Intern",
          location: "Remote / Bengaluru",
          is_remote: true,
          salary_range: "$1,200 / month stipend",
          description: "Join our dynamic agile engineering squad building real-time micro-SaaS applications using React, Django, and PostgreSQL.",
          user_match: {
            match_percentage: 85,
            matched_skills: ["Python", "React.js", "JavaScript", "HTML5", "CSS3"],
            missing_skills: ["Docker"]
          }
        },
        {
          id: 2,
          title: "Python Backend Engineering Intern",
          company_name: "CloudScale Systems",
          job_type_display: "Internship",
          experience_level_display: "Student / Intern",
          location: "Hyderabad / Hybrid",
          is_remote: true,
          salary_range: "$1,000 / month stipend",
          description: "Work directly on high-performance data pipelines, database query optimization, and Redis caching layers.",
          user_match: {
            match_percentage: 75,
            matched_skills: ["Python", "SQL", "Git"],
            missing_skills: ["Docker", "Redis"]
          }
        }
      ]
    };
  }

  // 9. AI Chat
  if (url.includes('/chat/sessions')) {
    if (method === 'post' && url.includes('/send')) {
      return {
        status: 200,
        data: {
          user_message: { id: Date.now(), sender: 'USER', message: 'Hello AI Mentor', created_at: new Date().toISOString() },
          ai_message: {
            id: Date.now() + 1,
            sender: 'AI',
            message: "Hello! As your SkillBridge AI Career Mentor, I recommend focusing on building 2 production-ready capstone projects and taking the Python assessment to benchmark your skills.",
            suggested_actions: ["Take Assessment", "View Roadmap", "Browse Jobs"],
            created_at: new Date().toISOString()
          }
        }
      };
    }
    return {
      status: 200,
      data: [{
        id: 1,
        title: "Career Guidance Session",
        messages: [{
          id: 1,
          sender: "AI",
          message: "Welcome to SkillBridge! I am your AI Technical Career Mentor. Ask me anything about career tracks, interview preparation, portfolio building, or roadmaps.",
          suggested_actions: ["How to prepare for a Python interview?", "Review Full Stack projects", "View Job Matches"],
          created_at: new Date().toISOString()
        }]
      }]
    };
  }

  // 10. Analytics & Notifications
  if (url.includes('/analytics/notifications')) {
    return {
      status: 200,
      data: {
        unread_count: 2,
        notifications: [
          {
            id: 1,
            title: "Welcome to SkillBridge!",
            message: "Your profile is active. Upload your resume or take an assessment to track your readiness score.",
            notification_type: "SYSTEM",
            action_url: "/dashboard",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Upcoming Mentorship Session",
            message: "Mentor Alex Rivera scheduled a 1-on-1 portfolio review session.",
            notification_type: "MENTORSHIP",
            action_url: "/mentor-dashboard",
            created_at: new Date().toISOString()
          }
        ]
      }
    };
  }

  // 11. Admin stats
  if (url.includes('/analytics/admin/stats')) {
    return {
      status: 200,
      data: {
        summary: {
          total_users: 128,
          total_students: 110,
          total_mentors: 14,
          total_career_roles: 6,
          total_skills_indexed: 36,
          total_jobs_posted: 6,
          total_job_applications: 42,
          total_assessments_taken: 88,
          average_readiness_score: 74.5,
          assessment_pass_rate: 82.0
        },
        career_distribution: [
          { role: "Full Stack Developer", students_enrolled: 45 },
          { role: "Python Developer", students_enrolled: 28 },
          { role: "AI Engineer", students_enrolled: 20 },
          { role: "Data Analyst", students_enrolled: 17 }
        ],
        application_status_breakdown: { APPLIED: 20, REVIEWING: 12, INTERVIEW_SCHEDULED: 6, OFFER_EXTENDED: 4 }
      }
    };
  }

  // Default empty fallback
  return { status: 200, data: [] };
};
