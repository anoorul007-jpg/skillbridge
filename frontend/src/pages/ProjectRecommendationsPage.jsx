import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2, CheckCircle2, Clock, Sparkles, ExternalLink,
  Code, ArrowRight, Layers, Filter
} from 'lucide-react';

export default function ProjectRecommendationsPage() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [difficultyFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = '/careers/projects/';
      if (difficultyFilter !== 'ALL') {
        url += `?difficulty=${difficultyFilter}`;
      }
      const res = await apiClient.get(url);
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'BEGINNER') return 'bg-emerald-100 text-emerald-800';
    if (diff === 'INTERMEDIATE') return 'bg-sky-100 text-sky-800';
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-1">
            <FolderGit2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Practical Portfolio Projects</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Industry-Aligned Project Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build real-world projects targeted directly at your missing skills to strengthen your portfolio and impress recruiters.
          </p>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100 text-xs font-semibold shrink-0">
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-xl transition ${
                difficultyFilter === d
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-100">
            <p className="text-sm font-semibold text-slate-600">No projects found matching the filter.</p>
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getDifficultyBadge(proj.difficulty)}`}>
                    {proj.difficulty}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{proj.estimated_hours} Hours</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{proj.title}</h3>
                  <span className="text-[11px] font-semibold text-sky-700 block mt-0.5">
                    Track: {proj.career_role_title}
                  </span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Tech Stack Chips */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Tech Stack:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(proj.technologies || []).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Core Features */}
                {proj.features && proj.features.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-800 block">Core Deliverables:</span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {proj.features.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Implementation Steps */}
                {proj.implementation_steps && proj.implementation_steps.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">Implementation Blueprint:</span>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                      {proj.implementation_steps.slice(0, 3).map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Starter Repository</span>
                <a
                  href={proj.github_starter_url || 'https://github.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>View Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
