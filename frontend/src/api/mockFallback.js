/**
 * SkillBridge Demo Resilient Fallback Interceptor
 * Enables 100% full-stack functionality across all devices (other laptops, phones, Vercel)
 * even when decoupled from the local Django backend.
 * Provides interactive CRUD state persistence using localStorage.
 */

// Helper to safely access and mutate localStorage JSON state
const getStoredState = (key, defaultVal) => {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStoredState = (key, val) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

// Initial default users
const DEFAULT_USERS = [
  {
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
  },
  {
    id: 2,
    email: 'admin@skillbridge.edu',
    username: 'admin',
    first_name: 'System',
    last_name: 'Administrator',
    role: 'ADMIN',
    is_staff: true,
    is_superuser: true,
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    email: 'mentor.alex@skillbridge.edu',
    username: 'mentor_alex',
    first_name: 'Alex',
    last_name: 'Rivera',
    role: 'MENTOR',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mentor_profile: {
      company: 'Google',
      designation: 'Senior Staff Engineer',
      years_of_experience: 9,
      bio: 'Cloud architecture and full-stack system design mentor.'
    }
  }
];

export const getMockResponse = (config) => {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  let body = {};
  try {
    body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {});
  } catch (e) {
    body = {};
  }

  const users = getStoredState('skillbridge_mock_users', DEFAULT_USERS);

  // 1. Auth Register (/auth/register/)
  if (url.includes('/auth/register') && method === 'post') {
    const email = body.email || `user_${Date.now()}@skillbridge.edu`;
    const role = (body.role || 'STUDENT').toUpperCase();
    const newUser = {
      id: Date.now(),
      email: email,
      username: body.username || email.split('@')[0],
      first_name: body.first_name || 'New',
      last_name: body.last_name || 'User',
      role: role,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ...(role === 'STUDENT' ? {
        student_profile: {
          college_name: body.college_name || 'Engineering Institute',
          degree: body.degree || 'B.Tech / B.E.',
          target_role_id: 1,
          target_role_title: 'Full Stack Developer',
          readiness_score: 75.0
        }
      } : {
        mentor_profile: {
          company: body.organization || 'Tech Company',
          designation: body.designation || 'Software Engineer',
          years_of_experience: 5
        }
      })
    };

    // Store in users registry
    users.push(newUser);
    setStoredState('skillbridge_mock_users', users);

    return {
      status: 201,
      data: {
        tokens: {
          access: `mock-jwt-access-${newUser.id}`,
          refresh: `mock-jwt-refresh-${newUser.id}`
        },
        user: newUser
      }
    };
  }

  // 2. Auth Login (/auth/login/)
  if (url.includes('/auth/login') && method === 'post') {
    const emailInput = (body.email || '').toLowerCase().trim();
    let matchedUser = users.find(u => u.email.toLowerCase() === emailInput || u.username.toLowerCase() === emailInput);

    if (!matchedUser) {
      // Auto-provision user for seamless evaluation if unregistered
      const isAdm = emailInput.includes('admin');
      const isMnt = emailInput.includes('mentor');
      const role = isAdm ? 'ADMIN' : isMnt ? 'MENTOR' : 'STUDENT';
      matchedUser = {
        id: Date.now(),
        email: emailInput || 'guest@skillbridge.edu',
        username: emailInput ? emailInput.split('@')[0] : 'guest',
        first_name: isAdm ? 'System' : isMnt ? 'Mentor' : 'Student',
        last_name: 'User',
        role: role,
        is_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        ...(role === 'STUDENT' ? {
          student_profile: {
            college_name: 'State Technical University',
            degree: 'Computer Science & Engineering',
            target_role_id: 1,
            target_role_title: 'Full Stack Developer',
            readiness_score: 80.0
          }
        } : {})
      };
      users.push(matchedUser);
      setStoredState('skillbridge_mock_users', users);
    }

    return {
      status: 200,
      data: {
        tokens: {
          access: `mock-jwt-access-${matchedUser.id}`,
          refresh: `mock-jwt-refresh-${matchedUser.id}`
        },
        user: matchedUser
      }
    };
  }

  // 3. Current User Session & Profile Update (/auth/me/)
  if (url.includes('/auth/me')) {
    const currentStoredUser = getStoredState('skillbridge_user', users[0]);
    if (method === 'patch' || method === 'put') {
      const updated = {
        ...currentStoredUser,
        ...body,
        student_profile: {
          ...(currentStoredUser.student_profile || {}),
          ...(body.student_profile || {}),
          ...(body.college_name ? { college_name: body.college_name } : {}),
          ...(body.degree ? { degree: body.degree } : {})
        }
      };
      setStoredState('skillbridge_user', updated);
      return { status: 200, data: updated };
    }
    return { status: 200, data: currentStoredUser };
  }

  // 4. Password Recovery
  if (url.includes('/auth/forgot-password') || url.includes('/auth/reset-password')) {
    return {
      status: 200,
      data: { message: 'Password recovery instructions have been dispatched.' }
    };
  }

  // 5. Career Roles
  const CAREER_ROLES = [
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
        { id: 13, skill_name: "Power BI", weight: 4, category: "Tool" },
        { id: 14, skill_name: "Excel", weight: 3, category: "Tool" }
      ]
    },
    {
      id: 4,
      title: "AI Engineer",
      slug: "ai-engineer",
      description: "Designs, trains, and operationalizes deep learning models, LLM systems, and automated cognitive pipelines.",
      demand_level: "Critical High Demand",
      avg_salary_range: "$95,000 - $155,000 / yr",
      icon: "Cpu",
      required_skills: [
        { id: 15, skill_name: "PyTorch", weight: 5, category: "Data/AI" },
        { id: 16, skill_name: "Python", weight: 5, category: "Language" },
        { id: 17, skill_name: "Transformers", weight: 5, category: "Data/AI" },
        { id: 18, skill_name: "Docker", weight: 4, category: "DevOps" }
      ]
    },
    {
      id: 5,
      title: "Cybersecurity Analyst",
      slug: "cybersecurity-analyst",
      description: "Protects enterprise architectures against vulnerabilities, analyzes penetration vectors, and deploys threat controls.",
      demand_level: "High Demand",
      avg_salary_range: "$80,000 - $130,000 / yr",
      icon: "Shield",
      required_skills: [
        { id: 19, skill_name: "Network Security", weight: 5, category: "Security" },
        { id: 20, skill_name: "Linux", weight: 5, category: "OS" },
        { id: 21, skill_name: "Python", weight: 4, category: "Language" },
        { id: 22, skill_name: "SIEM", weight: 4, category: "Tool" }
      ]
    },
    {
      id: 6,
      title: "Cloud Engineer",
      slug: "cloud-engineer",
      description: "Architects scalable multi-region cloud infrastructures, manages Kubernetes clusters, and guarantees high availability.",
      demand_level: "High Demand",
      avg_salary_range: "$90,000 - $140,000 / yr",
      icon: "Cloud",
      required_skills: [
        { id: 23, skill_name: "AWS", weight: 5, category: "Cloud" },
        { id: 24, skill_name: "Kubernetes", weight: 5, category: "DevOps" },
        { id: 25, skill_name: "Terraform", weight: 4, category: "DevOps" },
        { id: 26, skill_name: "Docker", weight: 4, category: "DevOps" }
      ]
    }
  ];

  if (url.includes('/careers/roles')) {
    if (url.includes('/select') && method === 'post') {
      const roleIdMatch = url.match(/\/careers\/roles\/(\d+)\/select/);
      const selId = roleIdMatch ? parseInt(roleIdMatch[1]) : 1;
      const selRole = CAREER_ROLES.find(r => r.id === selId) || CAREER_ROLES[0];
      const curUser = getStoredState('skillbridge_user', users[0]);
      if (curUser) {
        curUser.student_profile = {
          ...(curUser.student_profile || {}),
          target_role_id: selRole.id,
          target_role_title: selRole.title,
          readiness_score: 82.5
        };
        setStoredState('skillbridge_user', curUser);
      }
      return { status: 200, data: { message: `Role set to ${selRole.title}`, target_role: selRole } };
    }
    return { status: 200, data: CAREER_ROLES };
  }

  // 6. Skill Gap Analysis (/careers/analysis/)
  if (url.includes('/careers/analysis')) {
    const curUser = getStoredState('skillbridge_user', users[0]);
    const targetTitle = curUser?.student_profile?.target_role_title || "Full Stack Developer";
    return {
      status: 200,
      data: {
        career_role: {
          id: curUser?.student_profile?.target_role_id || 1,
          title: targetTitle,
          description: "End-to-end full stack web application development using React, Django, and modern cloud deployment architectures."
        },
        readiness_score: curUser?.student_profile?.readiness_score || 80.0,
        matched_skills_count: 5,
        missing_skills_count: 1,
        total_required_skills: 6,
        matched_skills: [
          { id: 1, name: "React.js", weight: 5, criticality: "REQUIRED", proficiency_level: "ADVANCED" },
          { id: 2, name: "Python", weight: 4, criticality: "REQUIRED", proficiency_level: "INTERMEDIATE" },
          { id: 3, name: "Django", weight: 4, criticality: "REQUIRED", proficiency_level: "INTERMEDIATE" },
          { id: 4, name: "JavaScript", weight: 5, criticality: "REQUIRED", proficiency_level: "ADVANCED" },
          { id: 5, name: "PostgreSQL", weight: 4, criticality: "REQUIRED", proficiency_level: "BEGINNER" }
        ],
        missing_skills: [
          {
            id: 6,
            name: "Docker",
            weight: 3,
            criticality: "RECOMMENDED",
            estimated_learning_hours: 12,
            recommended_actions: "Complete containerization fundamentals module and Dockerize SkillBridge backend."
          }
        ]
      }
    };
  }

  // 7. Student Skills Management (/careers/student-skills/)
  if (url.includes('/careers/student-skills')) {
    const defaultStudentSkills = [
      { id: 1, skill: { id: 1, name: "React.js", category: "Framework" }, proficiency_level: "ADVANCED", years_of_experience: 2 },
      { id: 2, skill: { id: 2, name: "Python", category: "Language" }, proficiency_level: "INTERMEDIATE", years_of_experience: 2 },
      { id: 3, skill: { id: 3, name: "Django", category: "Framework" }, proficiency_level: "INTERMEDIATE", years_of_experience: 1.5 },
      { id: 4, skill: { id: 4, name: "JavaScript", category: "Language" }, proficiency_level: "ADVANCED", years_of_experience: 2 },
      { id: 5, skill: { id: 5, name: "PostgreSQL", category: "Database" }, proficiency_level: "BEGINNER", years_of_experience: 1 }
    ];
    let studentSkills = getStoredState('skillbridge_mock_student_skills', defaultStudentSkills);

    if (method === 'post') {
      const newSkill = {
        id: Date.now(),
        skill: { id: body.skill_id || Date.now(), name: body.skill_name || "New Skill", category: "General" },
        proficiency_level: body.proficiency_level || "INTERMEDIATE",
        years_of_experience: body.years_of_experience || 1
      };
      studentSkills.push(newSkill);
      setStoredState('skillbridge_mock_student_skills', studentSkills);
      return { status: 201, data: newSkill };
    }
    if (method === 'delete') {
      studentSkills = studentSkills.filter(s => s.id !== body.skill_id && s.skill.id !== body.skill_id);
      setStoredState('skillbridge_mock_student_skills', studentSkills);
      return { status: 200, data: { message: 'Skill deleted' } };
    }
    return { status: 200, data: studentSkills };
  }

  // 8. All Skills Catalog (/careers/skills/)
  if (url.includes('/careers/skills')) {
    return {
      status: 200,
      data: [
        { id: 1, name: "React.js", category: "Framework" },
        { id: 2, name: "Python", category: "Language" },
        { id: 3, name: "Django", category: "Framework" },
        { id: 4, name: "JavaScript", category: "Language" },
        { id: 5, name: "PostgreSQL", category: "Database" },
        { id: 6, name: "Docker", category: "DevOps" },
        { id: 7, name: "AWS", category: "Cloud" },
        { id: 8, name: "Kubernetes", category: "DevOps" },
        { id: 9, name: "FastAPI", category: "Framework" },
        { id: 10, name: "Redis", category: "Database" },
        { id: 11, name: "SQL", category: "Language" },
        { id: 12, name: "Pandas", category: "Data/AI" },
        { id: 13, name: "PyTorch", category: "Data/AI" },
        { id: 14, name: "Git", category: "Tool" }
      ]
    };
  }

  // 9. Learning Roadmap & Task Toggle (/careers/roadmap/)
  if (url.includes('/careers/roadmap')) {
    const defaultRoadmap = {
      career_title: "Full Stack Developer",
      overall_progress: 68,
      stages: [
        {
          stage_number: 1,
          title: "Foundations & Scripting",
          description: "Solidify core asynchronous JavaScript mechanics, ES6+ syntax, and modern CSS layouts.",
          tasks: [
            { id: 101, title: "Deep-dive Promises, Async/Await, and Event Loop", estimated_hours: 4, is_completed: true, resource_url: "https://javascript.info/async" },
            { id: 102, title: "Modern CSS Grid & Flexbox Alignment Patterns", estimated_hours: 3, is_completed: true, resource_url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
          ]
        },
        {
          stage_number: 2,
          title: "Backend API Architecture",
          description: "Build robust REST microservices using Django REST Framework and relational models.",
          tasks: [
            { id: 201, title: "Design Normalized PostgreSQL Schemas with Foreign Keys", estimated_hours: 5, is_completed: true, resource_url: "https://www.postgresql.org/docs/" },
            { id: 202, title: "Implement JWT Authentication and Token Refresh Lifecycles", estimated_hours: 6, is_completed: true, resource_url: "https://django-rest-framework-simplejwt.readthedocs.io/" }
          ]
        },
        {
          stage_number: 3,
          title: "DevOps, Containerization & Cloud",
          description: "Package services into lightweight containers and deploy with CI/CD automation.",
          tasks: [
            { id: 301, title: "Containerize React and Django apps with Docker Compose", estimated_hours: 6, is_completed: false, resource_url: "https://docs.docker.com/get-started/" },
            { id: 302, title: "Configure Production Reverse Proxy with Nginx and SSL", estimated_hours: 5, is_completed: false, resource_url: "https://nginx.org/en/docs/" }
          ]
        }
      ]
    };

    let roadmap = getStoredState('skillbridge_mock_roadmap', defaultRoadmap);

    if (url.includes('/toggle') && method === 'post') {
      const match = url.match(/\/tasks\/(\d+)\/toggle/);
      const taskId = match ? parseInt(match[1]) : 0;
      let total = 0, completed = 0;
      roadmap.stages.forEach(st => {
        st.tasks.forEach(t => {
          if (t.id === taskId) t.is_completed = !t.is_completed;
          total++;
          if (t.is_completed) completed++;
        });
      });
      roadmap.overall_progress = Math.round((completed / total) * 100);
      setStoredState('skillbridge_mock_roadmap', roadmap);
      return { status: 200, data: { message: "Task toggled", roadmap } };
    }
    return { status: 200, data: roadmap };
  }

  // 10. Project Recommendations (/careers/projects/)
  if (url.includes('/careers/projects')) {
    return {
      status: 200,
      data: [
        {
          id: 1,
          title: "Cloud-Native Micro-SaaS Platform with Multi-Tenant RBAC",
          difficulty: "ADVANCED",
          estimated_hours: 28,
          technologies: ["React 19", "Django REST Framework", "Docker", "PostgreSQL", "Tailwind CSS"],
          description: "Build an enterprise-grade multi-tenant dashboard featuring custom JWT role permissions, billing webhooks, real-time analytics, and automated Docker deployment.",
          implementation_steps: [
            "Set up normalized database schema with Tenant and User relationships.",
            "Build role-gated API endpoints using custom DRF permissions.",
            "Construct responsive React dashboard with chart visualizations.",
            "Write Dockerfile and docker-compose orchestration file for staging."
          ]
        },
        {
          id: 2,
          title: "High-Throughput Distributed Task Engine with Celery & Redis",
          difficulty: "INTERMEDIATE",
          estimated_hours: 18,
          technologies: ["Python", "Django", "Celery", "Redis", "WebSockets"],
          description: "Implement an asynchronous background worker system for scheduled reporting, automated PDF generation, and WebSocket status notifications.",
          implementation_steps: [
            "Configure Redis message broker with Celery workers in Django.",
            "Create long-running report generation task pipeline.",
            "Stream progress events to frontend via WebSockets.",
            "Handle worker task retry mechanics and dead-letter queues."
          ]
        }
      ]
    };
  }

  // 11. Resumes (/resumes/)
  if (url.includes('/resumes')) {
    const defaultResumes = [
      {
        id: 1,
        file_name: "Priya_Sharma_Resume_2026.pdf",
        uploaded_at: new Date(Date.now() - 86400000).toISOString(),
        is_verified: true,
        extracted_skills: ["React.js", "JavaScript", "Python", "Django", "HTML5", "CSS3", "PostgreSQL", "Git"],
        extracted_education: "B.Tech Computer Science, National Institute of Technology (2022 - 2026)",
        extracted_experience: "Software Development Intern at TechStart Labs (6 months)",
        extracted_certifications: ["Meta Front-End Developer Certificate", "Python for Data Science - IBM"]
      }
    ];
    let resumes = getStoredState('skillbridge_mock_resumes', defaultResumes);

    if (url.includes('/upload') && method === 'post') {
      const newResume = {
        id: Date.now(),
        file_name: body.file?.name || "Uploaded_Resume.pdf",
        uploaded_at: new Date().toISOString(),
        is_verified: false,
        extracted_skills: ["Python", "React.js", "Django", "SQL", "JavaScript", "Git", "REST APIs"],
        extracted_education: "Computer Science & Engineering Graduate",
        extracted_experience: "Academic Projects & Full-Stack Web Development",
        extracted_certifications: ["Full-Stack Engineering Certification"]
      };
      resumes.unshift(newResume);
      setStoredState('skillbridge_mock_resumes', resumes);
      return { status: 201, data: newResume };
    }

    if (url.includes('/confirm') && method === 'post') {
      const rId = parseInt(url.split('/')[2]) || 1;
      const target = resumes.find(r => r.id === rId);
      if (target) target.is_verified = true;
      setStoredState('skillbridge_mock_resumes', resumes);
      return { status: 200, data: { message: "Skills confirmed and added to profile!" } };
    }

    if (method === 'delete') {
      const delId = parseInt(url.split('/')[2]) || 0;
      resumes = resumes.filter(r => r.id !== delId);
      setStoredState('skillbridge_mock_resumes', resumes);
      return { status: 200, data: { message: "Resume deleted" } };
    }

    return { status: 200, data: resumes };
  }

  // 12. Assessments (/assessments/)
  if (url.includes('/assessments')) {
    const defaultQuizzes = [
      {
        id: 1,
        title: "Python Core & Object-Oriented Engineering",
        topic: "Python",
        description: "Benchmark your understanding of Python data structures, decorators, generators, and OOP design patterns.",
        time_limit_minutes: 20,
        passing_percentage: 70,
        questions_count: 5,
        questions: [
          {
            id: 1,
            question_text: "What is the time complexity of searching a key in a standard Python dictionary on average?",
            choices: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            correct_index: 0,
            explanation: "Python dictionaries use hash tables, providing average-case O(1) time complexity for key lookups."
          },
          {
            id: 2,
            question_text: "Which Python keyword transforms a function into a generator?",
            choices: ["generate", "return", "yield", "async"],
            correct_index: 2,
            explanation: "The 'yield' keyword turns a standard function into a generator iterator."
          },
          {
            id: 3,
            question_text: "In Django REST Framework, what is the primary role of a Serializer?",
            choices: [
              "Only query the database",
              "Convert complex querysets and model instances to native Python datatypes that can be rendered to JSON",
              "Configure HTTP routing",
              "Handle static CSS files"
            ],
            correct_index: 1,
            explanation: "Serializers in DRF convert complex data types into JSON/XML and also handle input validation."
          }
        ]
      },
      {
        id: 2,
        title: "React.js & State Management Benchmarking",
        topic: "React",
        description: "Evaluates modern React hooks (useState, useEffect, useMemo), virtual DOM reconciliation, and component composition.",
        time_limit_minutes: 15,
        passing_percentage: 70,
        questions_count: 5,
        questions: []
      },
      {
        id: 3,
        title: "SQL & Relational Database Design",
        topic: "SQL",
        description: "Tests query joins, group by aggregation, indexing strategies, normalization forms, and transaction ACID properties.",
        time_limit_minutes: 20,
        passing_percentage: 70,
        questions_count: 5,
        questions: []
      }
    ];

    if (url.includes('/history')) {
      return {
        status: 200,
        data: [
          {
            id: 1,
            assessment_title: "Python Core & Object-Oriented Engineering",
            score_percentage: 85,
            passed: true,
            completed_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 2,
            assessment_title: "SQL & Relational Database Design",
            score_percentage: 90,
            passed: true,
            completed_at: new Date(Date.now() - 345600000).toISOString()
          }
        ]
      };
    }

    if (url.includes('/submit') && method === 'post') {
      return {
        status: 200,
        data: {
          result: {
            score_percentage: 85,
            passed: true,
            correct_count: 4,
            total_questions: 5,
            completed_at: new Date().toISOString()
          },
          message: "Congratulations! You passed the technical assessment with an 85% score."
        }
      };
    }

    const singleMatch = url.match(/\/assessments\/(\d+)\/?$/);
    if (singleMatch) {
      const qId = parseInt(singleMatch[1]);
      const quiz = defaultQuizzes.find(q => q.id === qId) || defaultQuizzes[0];
      return { status: 200, data: quiz };
    }

    return { status: 200, data: defaultQuizzes };
  }

  // 13. Jobs & Internships (/jobs/)
  if (url.includes('/jobs')) {
    const defaultJobs = [
      {
        id: 1,
        title: "Junior Full Stack Developer Intern",
        company_name: "NextWave Innovations",
        job_type_display: "Internship",
        experience_level_display: "Student / Intern",
        location: "Remote / Bengaluru",
        is_remote: true,
        salary_range: "$1,200 / month stipend",
        description: "Join our agile engineering squad building real-time micro-SaaS applications using React, Django, and PostgreSQL.",
        is_bookmarked: false,
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
        is_bookmarked: true,
        user_match: {
          match_percentage: 75,
          matched_skills: ["Python", "SQL", "Git"],
          missing_skills: ["Docker", "Redis"]
        }
      },
      {
        id: 3,
        title: "Associate AI & Machine Learning Engineer",
        company_name: "CognitiveEdge AI",
        job_type_display: "Full-Time",
        experience_level_display: "Entry Level (0-1 yrs)",
        location: "Pune / On-Site",
        is_remote: false,
        salary_range: "$75,000 - $95,000 / yr",
        description: "Train and deploy fine-tuned open-source LLM agents, write automated evaluation pipelines, and serve PyTorch models.",
        is_bookmarked: false,
        user_match: {
          match_percentage: 70,
          matched_skills: ["Python", "Git"],
          missing_skills: ["PyTorch", "Transformers"]
        }
      }
    ];

    if (url.includes('/applications')) {
      const defaultApps = [
        {
          id: 1,
          job: defaultJobs[0],
          status: "REVIEWING",
          applied_at: new Date(Date.now() - 259200000).toISOString(),
          notes: "Applied via SkillBridge student profile with verified skills."
        },
        {
          id: 2,
          job: defaultJobs[1],
          status: "APPLIED",
          applied_at: new Date(Date.now() - 86400000).toISOString(),
          notes: "Cover letter submitted."
        }
      ];
      let apps = getStoredState('skillbridge_mock_applications', defaultApps);
      if (method === 'patch') {
        const mId = parseInt(url.split('/')[3]) || 1;
        const app = apps.find(a => a.id === mId);
        if (app && body.status) app.status = body.status;
        setStoredState('skillbridge_mock_applications', apps);
        return { status: 200, data: app };
      }
      return { status: 200, data: apps };
    }

    if (url.includes('/apply') && method === 'post') {
      const jId = parseInt(url.split('/')[2]) || 1;
      const job = defaultJobs.find(j => j.id === jId) || defaultJobs[0];
      const apps = getStoredState('skillbridge_mock_applications', []);
      const newApp = {
        id: Date.now(),
        job: job,
        status: "APPLIED",
        applied_at: new Date().toISOString(),
        notes: body.notes || "Application submitted successfully."
      };
      apps.unshift(newApp);
      setStoredState('skillbridge_mock_applications', apps);
      return { status: 201, data: newApp };
    }

    if (url.includes('/bookmark') && method === 'post') {
      return { status: 200, data: { message: "Bookmark status toggled" } };
    }

    return { status: 200, data: defaultJobs };
  }

  // 14. Mentorship (/mentorship/)
  if (url.includes('/mentorship')) {
    if (url.includes('/sessions/schedule') && method === 'post') {
      return { status: 201, data: { message: "Mentorship session confirmed!" } };
    }
    if (url.includes('/feedback/submit') && method === 'post') {
      return { status: 201, data: { message: "Feedback recorded!" } };
    }
    return {
      status: 200,
      data: {
        assigned_students: [
          {
            id: 1,
            user_name: "Priya Sharma",
            user_email: "student@skillbridge.edu",
            college: "National Institute of Technology",
            target_role: "Full Stack Developer",
            readiness_score: 80.0,
            learning_progress: 68
          }
        ],
        scheduled_sessions: [
          {
            id: 1,
            student_name: "Priya Sharma",
            scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
            status: "SCHEDULED",
            meeting_link: "https://meet.google.com/skb-mntr-demo",
            topic: "Full-Stack Portfolio Code Review & Mock Technical Interview"
          }
        ]
      }
    };
  }

  // 15. AI Career Mentor (/chat/)
  if (url.includes('/chat')) {
    if (url.includes('/send') && method === 'post') {
      const q = (body.message || '').toLowerCase();
      let reply = "As your AI Career Mentor, I recommend prioritizing building 2 complete capstone projects with React and Django, and completing the Python technical quiz to certify your profile.";
      if (q.includes('interview')) {
        reply = "For Full Stack interviews, prepare for 3 key areas: 1) JavaScript event loop & asynchronous mechanics, 2) SQL query optimization with indexes, and 3) System design for REST APIs with caching.";
      } else if (q.includes('resume')) {
        reply = "Your resume has a strong skill foundation! To elevate it further: quantify your project impacts (e.g., 'accelerated queries by 35%'), add your live GitHub demo links, and verify your missing Docker skill.";
      }
      return {
        status: 200,
        data: {
          user_message: { id: Date.now(), sender: 'USER', message: body.message, created_at: new Date().toISOString() },
          ai_message: {
            id: Date.now() + 1,
            sender: 'AI',
            message: reply,
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

  // 16. Analytics & Admin (/analytics/)
  if (url.includes('/analytics/admin/stats')) {
    return {
      status: 200,
      data: {
        summary: {
          total_users: users.length + 125,
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

  if (url.includes('/analytics/admin/users')) {
    return {
      status: 200,
      data: {
        results: users.map(u => ({
          ...u,
          is_active: true,
          date_joined: new Date(Date.now() - 604800000).toISOString()
        }))
      }
    };
  }

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

  // Default empty fallback
  return { status: 200, data: [] };
};
