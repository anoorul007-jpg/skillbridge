import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users, Calendar, MessageSquare, Award, ExternalLink,
  Plus, CheckCircle2, Star, Clock, AlertCircle, X, ArrowRight
} from 'lucide-react';

export default function MentorDashboardPage() {
  const { user, isMentor } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [scheduleModalRel, setScheduleModalRel] = useState(null);
  const [feedbackModalRel, setFeedbackModalRel] = useState(null);

  // Schedule session form
  const [sessionForm, setSessionForm] = useState({
    title: '1-on-1 Career & Code Architecture Review',
    agenda: 'Review capstone project code structure, explain database index optimization, and conduct mock interview.',
    scheduled_at: '',
    duration_minutes: 45,
    meeting_link: 'https://meet.google.com/sb-mentorship-session',
  });

  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    feedback_text: '',
    project_suggestions: '',
    rating: 5,
  });

  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/mentorship/dashboard/');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load mentor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleModalRel) return;

    try {
      await apiClient.post('/mentorship/sessions/schedule/', {
        relationship_id: scheduleModalRel.id,
        ...sessionForm,
      });
      setActionSuccess('Mentoring session scheduled successfully!');
      setScheduleModalRel(null);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to schedule session:', err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackModalRel) return;

    try {
      await apiClient.post('/mentorship/feedback/submit/', {
        relationship_id: feedbackModalRel.id,
        ...feedbackForm,
      });
      setActionSuccess('Feedback and project guidance recorded successfully!');
      setFeedbackModalRel(null);
      setFeedbackForm({ feedback_text: '', project_suggestions: '', rating: 5 });
      fetchDashboard();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Mentorship Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isMentor ? 'Mentor Workspace & Student Roster' : 'My Mentorship Sessions'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isMentor
              ? 'Review student progress, track skill readiness, schedule 1-on-1s, and submit project advice.'
              : 'Connect with verified industry mentors for guidance and portfolio reviews.'}
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Mentor Statistics Overview */}
      {isMentor && dashboardData?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <span className="text-2xl font-extrabold text-slate-900">{dashboardData.stats.total_students}</span>
            <p className="text-xs text-slate-500 mt-1">Assigned Mentees</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <span className="text-2xl font-extrabold text-sky-600">{dashboardData.stats.average_readiness}%</span>
            <p className="text-xs text-slate-500 mt-1">Avg Student Readiness</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <span className="text-2xl font-extrabold text-emerald-600">{dashboardData.stats.upcoming_sessions}</span>
            <p className="text-xs text-slate-500 mt-1">Upcoming Sessions</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <span className="text-2xl font-extrabold text-indigo-600">{dashboardData.stats.feedbacks_given}</span>
            <p className="text-xs text-slate-500 mt-1">Feedbacks Given</p>
          </div>
        </div>
      )}

      {/* Assigned Students Roster (Mentor View) */}
      {isMentor ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Assigned Student Cohort</span>
            </h2>
            <span className="text-xs text-slate-400">
              {dashboardData?.relationships?.length || 0} Students
            </span>
          </div>

          <div className="space-y-4">
            {(!dashboardData?.relationships || dashboardData.relationships.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">No students assigned yet.</p>
            ) : (
              dashboardData.relationships.map((rel) => {
                const stats = rel.student_stats || {};
                return (
                  <div
                    key={rel.id}
                    className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rel.student?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'}
                          alt="Student"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {rel.student?.first_name ? `${rel.student.first_name} ${rel.student.last_name}` : rel.student?.username}
                          </h3>
                          <p className="text-xs text-slate-500">{rel.student?.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          Readiness: {stats.readiness_score || 0}%
                        </span>
                        <span>•</span>
                        <span>{stats.degree || 'Degree'} at {stats.college || 'College'}</span>
                        <span>•</span>
                        <span>Roadmap Progress: {stats.roadmap_progress || 0}%</span>
                        <span>•</span>
                        <span>Tests: {stats.assessments_taken || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setScheduleModalRel(rel)}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-xs"
                      >
                        Schedule 1-on-1
                      </button>
                      <button
                        onClick={() => setFeedbackModalRel(rel)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition shadow-xs"
                      >
                        Give Feedback
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Student View of Assigned Mentors & Feedback */
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">My Mentors & Reviews</h2>
            <div className="space-y-4">
              {dashboardData?.relationships?.map((rel) => (
                <div key={rel.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rel.mentor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                      alt="Mentor"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {rel.mentor?.first_name ? `${rel.mentor.first_name} ${rel.mentor.last_name}` : rel.mentor?.username}
                      </h3>
                      <p className="text-xs text-slate-500">{rel.mentor?.mentor_profile?.designation} • {rel.mentor?.mentor_profile?.organization}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Active Mentor
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Sessions Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-bold text-slate-900">Upcoming Scheduled Mentoring Sessions</h2>
        </div>

        {(!dashboardData?.upcoming_sessions || dashboardData.upcoming_sessions.length === 0) ? (
          <p className="text-xs text-slate-500 py-4 text-center">No upcoming sessions on the calendar.</p>
        ) : (
          <div className="space-y-3">
            {dashboardData.upcoming_sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{sess.title}</h4>
                  <p className="text-slate-500">{sess.agenda}</p>
                  <p className="text-slate-400 font-mono text-[11px]">
                    {new Date(sess.scheduled_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })} • {sess.duration_minutes} Mins
                  </p>
                </div>

                {sess.meeting_link && (
                  <a
                    href={sess.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition shrink-0"
                  >
                    <span>Launch Google Meet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Session Modal */}
      {scheduleModalRel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Schedule Mentoring Session with {scheduleModalRel.student?.first_name || 'Student'}
              </h3>
              <button onClick={() => setScheduleModalRel(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Topic / Title</label>
                <input
                  type="text"
                  required
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agenda & Preparation Points</label>
                <textarea
                  rows={3}
                  value={sessionForm.agenda}
                  onChange={(e) => setSessionForm({ ...sessionForm, agenda: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={sessionForm.scheduled_at}
                    onChange={(e) => setSessionForm({ ...sessionForm, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={sessionForm.duration_minutes}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={sessionForm.meeting_link}
                  onChange={(e) => setSessionForm({ ...sessionForm, meeting_link: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalRel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Give Feedback Modal */}
      {feedbackModalRel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Submit Feedback for {feedbackModalRel.student?.first_name || 'Student'}
              </h3>
              <button onClick={() => setFeedbackModalRel(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluation & Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={feedbackForm.feedback_text}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_text: e.target.value })}
                  placeholder="Detail progress, code quality observations, and strengths shown..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Project Improvements</label>
                <textarea
                  rows={3}
                  value={feedbackForm.project_suggestions}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, project_suggestions: e.target.value })}
                  placeholder="e.g. Implement Docker containerization, add Redis caching, and write comprehensive API unit tests..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Performance Rating (1 - 5 Stars)</label>
                <select
                  value={feedbackForm.rating}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars - Exceptional Competence</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars - Solid Progress</option>
                  <option value={3}>⭐⭐⭐ 3 Stars - Average Alignment</option>
                  <option value={2}>⭐⭐ 2 Stars - Foundational Work Required</option>
                  <option value={1}>⭐ 1 Star - Significant Gaps</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalRel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
