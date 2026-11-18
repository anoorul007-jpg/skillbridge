import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import {
  Send, CheckCircle2, Clock, Calendar, AlertCircle,
  Briefcase, Edit3, X, ArrowRight
} from 'lucide-react';

export default function ApplicationTrackingPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null);
  const [appNotes, setAppNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/jobs/applications/');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OFFER_EXTENDED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'REVIEWING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      const res = await apiClient.patch(`/jobs/applications/${editingApp.id}/`, {
        notes: appNotes,
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === editingApp.id ? res.data : a))
      );
      setEditingApp(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-1">
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span>Recruitment Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Job Applications Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track submitted applications, upcoming interview schedules, and personal preparation notes.
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition shrink-0"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse More Jobs</span>
        </Link>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No applications submitted yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore our Internship & Job portal to find positions with high skill match scores.
            </p>
            <Link
              to="/jobs"
              className="inline-block px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition"
            >
              Explore Job Listings
            </Link>
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                    {app.status_display}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Applied on {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{app.job?.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {app.job?.company_name} • {app.job?.location} • {app.job?.salary_range}
                  </p>
                </div>

                {/* Interview Alert */}
                {app.interview_date && (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      Interview Scheduled for: <strong>{new Date(app.interview_date).toLocaleString()}</strong>
                    </span>
                  </div>
                )}

                {/* Personal Notes */}
                {app.notes ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">My Preparation Notes:</strong>
                    <p>{app.notes}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No preparation notes added.</p>
                )}
              </div>

              <button
                onClick={() => {
                  setEditingApp(app);
                  setAppNotes(app.notes || '');
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Notes</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Edit Notes Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Application Notes</h3>
              <button onClick={() => setEditingApp(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Interview preparation tips & company research
                </label>
                <textarea
                  rows={4}
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="e.g. Reviewed Django ORM queries and React lifecycle hooks. Need to ask about deployment stack in round 2."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
