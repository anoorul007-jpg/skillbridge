import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Compass, CheckCircle2, ArrowRight, Layers, Code,
  BarChart3, Cpu, ShieldCheck, Cloud, Sparkles, TrendingUp
} from 'lucide-react';

const ICON_MAP = {
  Layers: Layers,
  Code: Code,
  BarChart3: BarChart3,
  Cpu: Cpu,
  ShieldCheck: ShieldCheck,
  Cloud: Cloud,
};

export default function CareerSelectionPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/careers/roles/');
      setRoles(res.data || []);
      const currentTarget = user?.student_profile?.target_role_id || res.data?.[0]?.id;
      setSelectedRoleId(currentTarget);
    } catch (err) {
      console.error('Failed to load career roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (roleId) => {
    setSelecting(true);
    setSuccessMsg('');
    try {
      const res = await apiClient.post(`/careers/roles/${roleId}/select/`);
      setSelectedRoleId(roleId);
      setSuccessMsg(res.data.message || 'Target career role updated!');

      // Update user state locally
      if (user && user.student_profile) {
        updateUser({
          ...user,
          student_profile: {
            ...user.student_profile,
            target_role_id: roleId,
            readiness_score: res.data.analysis?.readiness_score || user.student_profile.readiness_score,
          },
        });
      }
    } catch (err) {
      console.error('Failed to select role:', err);
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Target Career Pathway Selection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore & Choose Your Career Path
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select a target role to dynamically generate your personalized learning roadmap, skill gap report, and project recommendations.
          </p>
        </div>

        <Link
          to="/skill-gap"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition shrink-0"
        >
          <span>View Skill Gap Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <Link
            to="/roadmap"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            Go to Roadmap →
          </Link>
        </div>
      )}

      {/* Career Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const IconComponent = ICON_MAP[role.icon] || Compass;
          const isSelected = selectedRoleId === role.id;

          return (
            <div
              key={role.id}
              className={`p-6 rounded-3xl bg-white border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-500 ring-4 ring-sky-50 shadow-md'
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {role.demand_level}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <span>{role.title}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    )}
                  </h3>
                  <p className="text-xs text-sky-700 font-semibold mt-0.5">
                    Avg Salary: {role.avg_salary_range}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                {/* Required Skills Tags */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    Core Technical Competencies ({role.required_skills_count || role.required_skills?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(role.required_skills || []).slice(0, 6).map((req) => (
                      <span
                        key={req.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium"
                      >
                        {req.skill_name}
                      </span>
                    ))}
                    {(role.required_skills?.length || 0) > 6 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-400">
                        +{(role.required_skills.length - 6)} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-100 mt-6">
                {isSelected ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Current Active Target</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectRole(role.id)}
                    disabled={selecting}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-sky-600 text-slate-800 hover:text-white border border-slate-200 hover:border-transparent font-semibold text-xs transition shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <span>Select as Target Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
