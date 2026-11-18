import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  Sparkles, Target, Compass, Award, FileText, Bot,
  Briefcase, CheckCircle2, ArrowRight, Clock, Calendar,
  ExternalLink, TrendingUp, AlertTriangle, Layers, BookOpen
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [mentorship, setMentorship] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel fetches for swift loading
      const [analysisRes, roadmapRes, testRes, mentorRes, jobsRes] = await Promise.allSettled([
        apiClient.get('/careers/analysis/'),
        apiClient.get('/careers/roadmap/'),
        apiClient.get('/assessments/history/'),
        apiClient.get('/mentorship/dashboard/'),
        apiClient.get('/jobs/'),
      ]);

      if (analysisRes.status === 'fulfilled') setAnalysis(analysisRes.value.data);
      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value.data);
      if (testRes.status === 'fulfilled') setAssessments(testRes.value.data);
      if (mentorRes.status === 'fulfilled') setMentorship(mentorRes.value.data);
      if (jobsRes.status === 'fulfilled') {
        // Sort jobs by highest match percentage
        const sorted = (jobsRes.value.data || []).sort(
          (a, b) => (b.user_match?.match_percentage || 0) - (a.user_match?.match_percentage || 0)
        );
        setMatchedJobs(sorted.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await apiClient.post(`/careers/roadmap/tasks/${taskId}/toggle/`);
      setRoadmap((prev) => {
        if (!prev) return prev;
        const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? res.data.task : t));
        return {
          ...prev,
          progress_percentage: res.data.roadmap_progress_percentage,
          tasks: updatedTasks,
        };
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const readinessScore = analysis?.readiness_score ?? (user?.student_profile?.readiness_score || 0);
  const targetRoleTitle = analysis?.career_role_title || user?.student_profile?.target_role_title || 'Full Stack Developer';
  const nextTask = roadmap?.tasks?.find((t) => !t.is_completed);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner & Score Radial */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Career: {targetRoleTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.first_name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track your verified technical competencies, conquer curriculum skill gaps, and achieve job readiness with personalized AI guidance.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/careers"
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Change Career Track
              </Link>
              <Link
                to="/skill-gap"
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                View Skill Gap Breakdown
              </Link>
            </div>
          </div>

          {/* Readiness Score Badge */}
          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-sky-400/30 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-sky-300">
                  {readinessScore}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Career Readiness</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Indicative Alignment Score</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {readinessScore >= 80 ? 'High Alignment' : readinessScore >= 50 ? 'Steady Progress' : 'Foundations Stage'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/resume-analyzer"
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-200 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Resume Scan</span>
          <span className="text-[10px] text-slate-500">Extract skills</span>
        </Link>

        <Link
          to="/skill-gap"
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-200 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Skill Gaps</span>
          <span className="text-[10px] text-slate-500">Compare roles</span>
        </Link>

        <Link
          to="/roadmap"
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-200 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Roadmap</span>
          <span className="text-[10px] text-slate-500">Personalized steps</span>
        </Link>

        <Link
          to="/assessments"
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-200 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Assessments</span>
          <span className="text-[10px] text-slate-500">Verify skills</span>
        </Link>

        <Link
          to="/ai-mentor"
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-200 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 block">AI Mentor</span>
          <span className="text-[10px] text-slate-500">24/7 Guidance</span>
        </Link>

        <Link
          to="/jobs"
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-200 transition-all text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Job Matches</span>
          <span className="text-[10px] text-slate-500">Ranked by skills</span>
        </Link>
      </div>

      {/* Grid: Learning Roadmap Progress & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Learning Roadmap */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>Learning Roadmap Progress</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {roadmap?.title || `${targetRoleTitle} Mastery Track`}
                </p>
              </div>
              <Link to="/roadmap" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1">
                <span>Full Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Completion</span>
                <span className="text-sky-600">{roadmap?.progress_percentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-sky-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap?.progress_percentage || 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">
                {roadmap?.completed_tasks || 0} of {roadmap?.total_tasks || 0} milestones completed
              </p>
            </div>

            {/* Next Milestone Card */}
            {nextTask ? (
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                    Current Milestone
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{nextTask.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{nextTask.description}</p>
                  <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Est. {nextTask.estimated_hours} hours • {nextTask.stage_name}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleToggleTask(nextTask.id)}
                  className="shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Done</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center text-xs text-emerald-800">
                🎉 All roadmap milestones completed! Check out our recommended projects.
              </div>
            )}
          </div>

          {/* Top Job Matches Preview */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-rose-500" />
                  <span>Skill-Matched Opportunities</span>
                </h3>
                <p className="text-xs text-slate-500">Live job listings matching your verified profile</p>
              </div>
              <Link to="/jobs" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1">
                <span>View All Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {matchedJobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Loading matching jobs...</p>
              ) : (
                matchedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {job.job_type_display}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{job.company_name} • {job.location}</p>
                      
                      {/* Matched skills pill */}
                      {job.user_match && (
                        <div className="flex items-center space-x-2 pt-1">
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {job.user_match.match_percentage}% Skill Match
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({job.user_match.matched_skills?.length || 0} matched, {job.user_match.missing_skills?.length || 0} missing)
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/jobs"
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-center shrink-0"
                    >
                      View Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Skill Breakdown, Assessments & Mentor */}
        <div className="space-y-6">
          
          {/* Skill Gap Summary Widget */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Target className="w-4 h-4 text-sky-600" />
              <span>Skills Matrix</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-xl font-bold text-emerald-700">
                  {analysis?.matched_skills?.length || 0}
                </span>
                <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">Matched Skills</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-xl font-bold text-amber-700">
                  {analysis?.missing_skills?.length || 0}
                </span>
                <p className="text-[11px] font-semibold text-amber-800 mt-0.5">Missing Skills</p>
              </div>
            </div>

            {/* Quick list of missing skills */}
            {analysis?.missing_skills && analysis.missing_skills.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Priority Gap Targets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missing_skills.slice(0, 5).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium"
                    >
                      {s.name} (w:{s.weight})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/skill-gap"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between"
              >
                <span>Full Gap Analysis Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Upcoming Mentorship Session Card */}
          {mentorship?.upcoming_sessions && mentorship.upcoming_sessions.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Mentorship</h3>
              </div>
              
              {mentorship.upcoming_sessions.slice(0, 1).map((sess) => (
                <div key={sess.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">{sess.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    {new Date(sess.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {sess.meeting_link && (
                    <a
                      href={sess.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs text-sky-600 font-semibold hover:text-sky-700"
                    >
                      <span>Join Video Session</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recent Technical Assessments */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Recent Assessments</span>
              </h3>
              <Link to="/assessments" className="text-xs text-sky-600 font-medium">
                Test Library
              </Link>
            </div>

            {assessments.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 text-center">
                <p className="text-xs text-slate-500">No tests taken yet.</p>
                <Link
                  to="/assessments"
                  className="mt-2 inline-block text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  Take Your First Assessment →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {assessments.slice(0, 3).map((res) => (
                  <div key={res.id} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{res.assessment_title}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(res.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                      res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {res.score_percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
