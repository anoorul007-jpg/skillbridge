import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, Briefcase, Award, Compass, BarChart3,
  TrendingUp, CheckCircle2, XCircle, Search, Filter, RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();

  const [statsData, setStatsData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await apiClient.get('/analytics/admin/stats/');
      setStatsData(statsRes.data);

      let usersUrl = '/analytics/admin/users/?';
      if (userRoleFilter) usersUrl += `role=${userRoleFilter}&`;
      const usersRes = await apiClient.get(usersUrl);
      setUsersList(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserActive = async (userId, currentStatus) => {
    try {
      const res = await apiClient.patch(`/analytics/admin/users/${userId}/`, {
        is_active: !currentStatus,
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const summary = statsData?.summary || {};

  const filteredUsers = usersList.filter((u) => {
    if (!searchUser) return true;
    const term = searchUser.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      (u.first_name && u.first_name.toLowerCase().includes(term)) ||
      (u.last_name && u.last_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-1">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Administration Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Platform Analytics & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time platform telemetry, student progress distributions, and account moderation.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-1">
          <span className="text-2xl font-extrabold text-slate-900">{summary.total_users || 0}</span>
          <p className="text-xs text-slate-500">Total Registered Users</p>
          <span className="text-[10px] text-slate-400 block">
            {summary.total_students || 0} Students • {summary.total_mentors || 0} Mentors
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-1">
          <span className="text-2xl font-extrabold text-sky-600">{summary.average_readiness_score || 0}%</span>
          <p className="text-xs text-slate-500">Avg Student Readiness</p>
          <span className="text-[10px] text-emerald-600 font-semibold block">Across all career tracks</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-1">
          <span className="text-2xl font-extrabold text-emerald-600">{summary.total_assessments_taken || 0}</span>
          <p className="text-xs text-slate-500">Tests Completed</p>
          <span className="text-[10px] text-slate-400 block">{summary.assessment_pass_rate || 0}% Pass Rate</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-1">
          <span className="text-2xl font-extrabold text-rose-600">{summary.total_job_applications || 0}</span>
          <p className="text-xs text-slate-500">Job Applications</p>
          <span className="text-[10px] text-slate-400 block">{summary.total_jobs_posted || 0} Active Postings</span>
        </div>
      </div>

      {/* Career Track Enrollment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-sky-600" />
            <span>Career Track Student Enrollment</span>
          </h2>

          <div className="space-y-3">
            {(statsData?.career_distribution || []).map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{item.role}</span>
                  <span className="text-sky-700">{item.students_enrolled} enrolled</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-sky-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (item.students_enrolled / (summary.total_students || 1)) * 100 || 20)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-rose-500" />
            <span>Application Status Distribution</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-center">
            {Object.entries(statsData?.application_status_breakdown || {}).map(([st, count], idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xl font-bold text-slate-900">{count}</span>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5 capitalize">
                  {st.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>User Directory & Role Moderation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage user access and platform permissions</p>
          </div>

          {/* Filter & Search */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user email..."
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="MENTOR">Mentors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="py-2.5">User</th>
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="py-3">
                    <p className="font-semibold text-slate-900">{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'MENTOR' ? 'bg-blue-100 text-blue-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-[11px] text-slate-400 font-medium">Verified Account</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
