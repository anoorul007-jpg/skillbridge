import React from 'react';
import { Sparkles, Shield, Cpu, Target, Award, Users, BookOpen, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Overview & Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About SkillBridge
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          An AI-powered skill development and career guidance platform designed specifically for college students and entry-level job seekers.
        </p>
      </div>

      {/* Mission & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            College curricula often lag behind fast-evolving tech demands. Fresh graduates struggle to determine which specific skills companies require, lack structured paths to bridge gaps, and send generic resumes with low interview callback rates.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Our Solution</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            SkillBridge provides an end-to-end guidance pipeline: parse your existing resume, compute transparent skill gap metrics against standardized industry roles, generate actionable week-by-week roadmaps, and practice real technical assessments.
          </p>
        </div>
      </div>

      {/* Transparent Methodology */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Our Transparent Scoring Methodology</h2>
            <p className="text-xs text-slate-500">Zero black-box calculations. Clean mathematical weighting.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
          Career Readiness Score (%) = ( ∑ Matched Required Skill Weights / ∑ All Required Skill Weights ) × 100
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 rounded-lg bg-slate-50">
            <span className="font-bold text-slate-900 block mb-1">1. Skill Weighting (1 - 5)</span>
            Each career role defines core technologies with weights reflecting industry recruitment priority.
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <span className="font-bold text-slate-900 block mb-1">2. Multi-Source Verification</span>
            Skills are confirmed via uploaded resume parsing, user self-declaration, and verified test completion.
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <span className="font-bold text-slate-900 block mb-1">3. Clear Disclaimer</span>
            Scores serve as actionable curriculum benchmarks and never claim to guarantee job placement.
          </div>
        </div>
      </div>

      {/* Technology Architecture */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Engineered with Modern Full-Stack Technologies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
            <p className="font-bold text-slate-900 text-sm">Frontend</p>
            <p className="text-slate-500 mt-1">React 19, Vite, Tailwind CSS, Recharts</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
            <p className="font-bold text-slate-900 text-sm">Backend API</p>
            <p className="text-slate-500 mt-1">Python Django 5, Django REST Framework</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
            <p className="font-bold text-slate-900 text-sm">Database</p>
            <p className="text-slate-500 mt-1">PostgreSQL Normalized Relational Schema</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
            <p className="font-bold text-slate-900 text-sm">AI & NLP</p>
            <p className="text-slate-500 mt-1">PyMuPDF, python-docx, Gemini API</p>
          </div>
        </div>
      </div>

    </div>
  );
}
