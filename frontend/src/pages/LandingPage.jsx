import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Target,
  Compass, FileText, Award, Users, Bot, Briefcase, ChevronRight,
  TrendingUp, Star, Laptop, Cpu
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: FileText,
      title: "NLP Resume Analyzer",
      desc: "Extract technical skills, education, and projects from PDF/DOCX resumes using PyMuPDF and NLP without manual entry."
    },
    {
      icon: Target,
      title: "Skill Gap Analysis",
      desc: "Compare your current skills against industry benchmarks. Get transparent percentage scores with mathematical breakdowns."
    },
    {
      icon: Compass,
      title: "Personalized Roadmaps",
      desc: "Receive customized multi-stage learning roadmaps targeting missing skills with curated resources and hands-on exercises."
    },
    {
      icon: Award,
      title: "Technical Assessments",
      desc: "Validate competencies in Python, SQL, JavaScript, HTML, and CSS with timed quizzes, code snippets, and instant verification."
    },
    {
      icon: Bot,
      title: "AI Career Mentor",
      desc: "Get 24/7 contextual guidance on career tracks, interview preparation, portfolio building, and technical roadblocks."
    },
    {
      icon: Briefcase,
      title: "Smart Job Matching",
      desc: "Discover internships and entry-level jobs ranked with real-time skill matching scores based on your verified abilities."
    }
  ];

  const careerTracks = [
    { title: "Full Stack Developer", demand: "High Demand", salary: "$85k - $135k", skills: ["React", "Django", "PostgreSQL", "Tailwind"] },
    { title: "Python Developer", demand: "Very High", salary: "$80k - $125k", skills: ["Python", "FastAPI", "Redis", "Docker"] },
    { title: "Data Analyst", demand: "High Demand", salary: "$70k - $110k", skills: ["SQL", "Pandas", "Power BI", "Statistics"] },
    { title: "AI Engineer", demand: "Critical Demand", salary: "$110k - $170k", skills: ["PyTorch", "Transformers", "RAG", "MLOps"] },
    { title: "Cybersecurity Analyst", demand: "High Demand", salary: "$80k - $130k", skills: ["OWASP", "Wireshark", "Linux", "SOC"] },
    { title: "Cloud Engineer", demand: "Very High", salary: "$90k - $145k", skills: ["AWS", "Terraform", "Kubernetes", "CI/CD"] },
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-16 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>AI-Powered Skill Development & Career Guidance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Bridge the Gap Between <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700">Campus Learning</span> & High-Impact Tech Careers
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, analyze skill gaps, follow personalized learning roadmaps, take verified technical assessments, and match directly with top internships and jobs.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
          >
            <span>{isAuthenticated ? "Go to Dashboard" : "Start Free Assessment"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors shadow-sm"
          >
            <span>Explore Demo Roles</span>
          </Link>
        </div>

        {/* Highlight Stats */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">36+</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Verified Tech Skills</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-600">6</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Major Career Tracks</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Transparent Math Scoring</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">24/7</p>
            <p className="text-xs text-slate-500 font-medium mt-1">AI Career Mentorship</p>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How SkillBridge Works</h2>
          <p className="mt-2 text-sm text-slate-600">
            A comprehensive pipeline engineered to take you from uncertain student to interview-ready professional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* In-Demand Career Tracks Preview */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Curated Pathways</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">Explore High-Demand Tech Tracks</h2>
            <p className="text-slate-400 text-sm mt-1">Every track includes weighted core skills, project specs, and tailored roadmaps.</p>
          </div>
          <Link
            to="/careers"
            className="inline-flex items-center space-x-1 text-sm font-semibold text-sky-400 hover:text-sky-300"
          >
            <span>View All Tracks</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerTracks.map((track, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-white">{track.title}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                    {track.demand}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Avg Salary: {track.salary}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {track.skills.map((s, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ethical AI & Academic Assurance */}
      <section className="p-8 rounded-3xl bg-sky-50 border border-sky-100 text-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Academic Integrity & Ethical AI Commitment</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          SkillBridge believes in transparency. Our Career Readiness Scores are calculated using transparent mathematical weighting: 
          <code className="mx-1 px-1.5 py-0.5 rounded bg-sky-100 font-mono text-sky-900 text-xs">
            Score = (Matched Skill Weights / Total Required Weights) × 100
          </code>. 
          We do not fabricate qualifications, guarantee employment, or use opaque black-box scoring. Students retain full ownership to edit, review, and confirm all extracted data.
        </p>
      </section>

      {/* CTA Card */}
      <section className="text-center py-10 space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900">Ready to Accelerate Your Career?</h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Join SkillBridge today. Benchmark your technical abilities, conquer your skill gaps, and step into tech with confidence.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 transition-all hover:scale-105"
          >
            <span>Create Your Free Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
