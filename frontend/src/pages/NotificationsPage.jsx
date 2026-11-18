import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import {
  Bell, CheckCircle2, Award, Briefcase, Users,
  Compass, AlertCircle, ArrowRight
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/analytics/notifications/');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/analytics/notifications/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'ASSESSMENT':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'APPLICATION':
        return <Briefcase className="w-4 h-4 text-rose-500" />;
      case 'MENTORSHIP':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'ROADMAP':
        return <Compass className="w-4 h-4 text-sky-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (typeFilter === 'ALL') return true;
    return n.notification_type === typeFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-1">
            <Bell className="w-3.5 h-3.5 text-sky-600" />
            <span>Activity Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Notifications & Updates
          </h1>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs font-semibold no-scrollbar">
        {['ALL', 'SYSTEM', 'ASSESSMENT', 'APPLICATION', 'MENTORSHIP', 'ROADMAP'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
              typeFilter === t
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No notifications found.</p>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`py-4 flex items-start space-x-3.5 ${!n.is_read ? 'bg-sky-50/20 -mx-6 px-6' : ''}`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 border border-slate-100">
                {getIconForType(n.notification_type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.action_url && (
                  <Link
                    to={n.action_url}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-sky-600 hover:text-sky-700 pt-1"
                  >
                    <span>View details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
