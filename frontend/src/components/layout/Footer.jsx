import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold text-white">
                Skill<span className="text-sky-400">Bridge</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI-Powered Skill Development & Career Guidance Platform bridging college education with high-demand tech careers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/careers" className="hover:text-white transition-colors">Career Pathways</Link></li>
              <li><Link to="/resume-analyzer" className="hover:text-white transition-colors">Resume Analyzer</Link></li>
              <li><Link to="/skill-gap" className="hover:text-white transition-colors">Skill Gap Engine</Link></li>
              <li><Link to="/roadmap" className="hover:text-white transition-colors">Personalized Roadmaps</Link></li>
              <li><Link to="/assessments" className="hover:text-white transition-colors">Technical Assessments</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Opportunities</h4>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Internship Board</Link></li>
              <li><Link to="/jobs?job_type=FULL_TIME" className="hover:text-white transition-colors">Entry-Level Roles</Link></li>
              <li><Link to="/ai-mentor" className="hover:text-white transition-colors">AI Career Mentor</Link></li>
              <li><Link to="/mentor-dashboard" className="hover:text-white transition-colors">Mentorship Program</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Ethical AI & Trust</h4>
            <div className="space-y-2 text-slate-400 leading-relaxed">
              <p className="flex items-start space-x-1.5">
                <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Transparent scoring: readiness metrics represent technical curriculum alignment, not guaranteed employment.</span>
              </p>
              <p className="flex items-start space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Strict privacy: your resume and data are never sold or used for public training.</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-400">
          <p>© {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built for academic excellence & industry readiness</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
