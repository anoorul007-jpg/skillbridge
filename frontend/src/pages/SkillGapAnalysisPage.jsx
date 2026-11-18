import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Target, CheckCircle2, AlertTriangle, ArrowRight, Compass,
  FolderGit2, ShieldCheck, Sparkles, BookOpen, Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function SkillGapAnalysisPage() {
  const { user } = useAuth();

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const rolesRes = await apiClient.get('/careers/roles/');
      setRoles(rolesRes.data || []);
      const initialRoleId = user?.student_profile?.target_role_id || rolesRes.data?.[0]?.id;
      setSelectedRoleId(initialRoleId);
      fetchAnalysisForRole(initialRoleId);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisForRole = async (roleId) => {
    try {
      const res = await apiClient.get(`/careers/analysis/?role_id=${roleId}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
    }
  };

  const handleRoleChange = (e) => {
    const newRoleId = e.target.value;
    setSelectedRoleId(newRoleId);
    fetchAnalysisForRole(newRoleId);
  };

  const chartData = [
    { name: 'Matched Weight', value: analysis?.matched_weight || 0, color: '#10b981' },
    { name: 'Missing Weight', value: (analysis?.total_required_weight || 0) - (analysis?.matched_weight || 0), color: '#f59e0b' },
  ];

  const readinessScore = analysis?.readiness_score || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header & Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-1">
            <Target className="w-3.5 h-3.5 text-sky-600" />
            <span>Mathematical Competency Alignment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Skill Gap Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare your verified competencies against industry role specifications with complete transparency.
          </p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="shrink-0">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Track</label>
          <select
            value={selectedRoleId}
            onChange={handleRoleChange}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 shadow-xs"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Readiness Score Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
              {analysis?.career_role_title} Track
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Career Readiness Score: {readinessScore}%
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {analysis?.recommendation_summary || 'Your verified competencies have been cross-referenced with role requirements.'}
            </p>
          </div>

          {/* Transparent Formula Display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 shrink-0 max-w-xs">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              Transparent Calculation
            </span>
            <div className="font-mono text-[11px] text-sky-800 bg-white p-2 rounded-lg border border-slate-200">
              Score = ({analysis?.matched_weight || 0} / {analysis?.total_required_weight || 0}) × 100 = {readinessScore}%
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Calculated using matched skill weights divided by total required skill weights.
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <Link
            to="/roadmap"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>Open Personalized Roadmap</span>
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>View Recommended Projects</span>
          </Link>
        </div>
      </div>

      {/* Matched vs Missing Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Matched Skills Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Matched Skills ({analysis?.matched_skills?.length || 0})</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Acquired
            </span>
          </div>

          <div className="space-y-2.5">
            {analysis?.matched_skills?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No matching skills found yet. Upload a resume or take a test!
              </p>
            ) : (
              analysis?.matched_skills?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {item.category} • Importance Weight: {item.weight}/5
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-md">
                    {item.proficiency || 'Verified'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing Skills Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-amber-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Skill Gaps to Conquer ({analysis?.missing_skills?.length || 0})</span>
            </h3>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Target for Roadmap
            </span>
          </div>

          <div className="space-y-2.5">
            {analysis?.missing_skills?.length === 0 ? (
              <p className="text-xs text-emerald-600 py-4 text-center font-medium">
                Awesome! You have zero identified skill gaps for this role.
              </p>
            ) : (
              analysis?.missing_skills?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {item.category} • Priority Weight: {item.weight}/5
                    </span>
                    <span className="text-[10px] text-amber-700 block italic">
                      {item.importance_note}
                    </span>
                  </div>

                  <Link
                    to="/roadmap"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 text-[11px] font-semibold hover:bg-amber-100"
                  >
                    Learn →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Ethical AI & Indicative Score Disclaimer */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Indicative Learning Metric Disclaimer: </strong>
          {analysis?.disclaimer || "This readiness score reflects technical skill requirement alignment based on industry benchmarks. It is an indicative learning metric and does not guarantee employment."}
        </div>
      </div>

    </div>
  );
}
