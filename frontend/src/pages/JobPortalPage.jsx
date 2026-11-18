import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Search, Filter, Bookmark, CheckCircle2,
  AlertCircle, ArrowRight, MapPin, DollarSign, Send, X, ExternalLink
} from 'lucide-react';

export default function JobPortalPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Apply modal
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [typeFilter, remoteOnly]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let url = '/jobs/?';
      if (typeFilter) url += `job_type=${typeFilter}&`;
      if (remoteOnly) url += `is_remote=true&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await apiClient.get(url);
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleBookmark = async (jobId) => {
    try {
      const res = await apiClient.post(`/jobs/${jobId}/bookmark/`);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_bookmarked: res.data.is_bookmarked } : j))
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleOpenApplyModal = (job) => {
    setSelectedJobToApply(job);
    setCoverNote(`Hello ${job.company_name} team,\n\nI am excited to apply for the ${job.title} role. My technical background and projects align closely with your requirements.`);
    setApplySuccess('');
    setApplyError('');
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!selectedJobToApply) return;

    setApplying(true);
    setApplyError('');
    try {
      await apiClient.post(`/jobs/${selectedJobToApply.id}/apply/`, {
        cover_note: coverNote,
      });

      setApplySuccess('Application submitted successfully! Track status in My Applications.');
      // Mark as applied in local state
      setJobs((prev) =>
        prev.map((j) => (j.id === selectedJobToApply.id ? { ...j, has_applied: true } : j))
      );
      setTimeout(() => {
        setSelectedJobToApply(null);
      }, 1500);
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-1">
            <Briefcase className="w-3.5 h-3.5 text-rose-600" />
            <span>Internships & Entry-Level Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Discover Matching Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jobs ranked with dynamic skill matching scores based on your verified skills portfolio.
          </p>
        </div>

        <Link
          to="/applications"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-xs shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Track My Applications</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by role title or company name..."
            className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>

        {/* Filter Badges */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Job Types</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FULL_TIME">Full-Time</option>
          </select>

          <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Remote Only</span>
          </label>
        </div>

      </div>

      {/* Job Listings Cards */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching jobs found.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const match = job.user_match;
            const matchScore = match?.match_percentage || 0;

            return (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  
                  {/* Top line with badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {job.job_type_display}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
                      {job.experience_level_display}
                    </span>
                    {job.is_remote && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Remote Friendly
                      </span>
                    )}

                    {/* Dynamic Skill Match Score Badge */}
                    <span className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full ${
                      matchScore >= 70
                        ? 'bg-emerald-100 text-emerald-800'
                        : matchScore >= 40
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {matchScore}% Skill Match
                    </span>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center space-x-3">
                      <span>{job.company_name}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-semibold text-slate-700">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>{job.salary_range}</span>
                      </span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required vs Matched Skills */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Required Skills Breakdown:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {match?.matched_skills?.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                        >
                          ✓ {s}
                        </span>
                      ))}
                      {match?.missing_skills?.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium"
                        >
                          Missing: {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions: Bookmark & Apply */}
                <div className="flex md:flex-col items-center justify-end gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleToggleBookmark(job.id)}
                    className={`p-2.5 rounded-xl border transition ${
                      job.is_bookmarked
                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={job.is_bookmarked ? 'Remove Bookmark' : 'Save Job'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  {job.has_applied ? (
                    <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenApplyModal(job)}
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition"
                    >
                      Quick Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apply Modal */}
      {selectedJobToApply && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Apply for {selectedJobToApply.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedJobToApply.company_name}</p>
              </div>
              <button
                onClick={() => setSelectedJobToApply(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{applySuccess}</span>
              </div>
            )}

            {applyError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Note / Introduction</label>
                <textarea
                  rows={4}
                  required
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-0.5">Attached Resume:</p>
                <p>Your verified SkillBridge profile & uploaded resume will be attached automatically.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobToApply(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying || !!applySuccess}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
