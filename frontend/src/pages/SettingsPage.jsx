import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  Settings, User, Lock, Bell, Shield, Sparkles,
  CheckCircle2, AlertCircle, LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSuccessMsg('Preferences saved successfully!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-1">
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>System & Account Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <User className="w-4 h-4 text-sky-600" />
          <span>Account Credentials</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Primary Email</span>
            <span className="font-semibold text-slate-800">{user?.email}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Account Type</span>
            <span className="font-semibold text-slate-800 capitalize">{user?.role?.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Bell className="w-4 h-4 text-sky-600" />
          <span>Notification Preferences</span>
        </h2>

        <form onSubmit={handleSavePreferences} className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-800 block">Roadmap Milestone Reminders</span>
              <span className="text-slate-400 text-[11px]">Receive reminders when roadmap tasks are pending</span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <span className="font-semibold text-slate-800 block">Skill-Matched Job Alerts</span>
              <span className="text-slate-400 text-[11px]">Get alerts when new jobs match &gt;75% of your skills</span>
            </div>
            <input
              type="checkbox"
              checked={jobAlertsEnabled}
              onChange={(e) => setJobAlertsEnabled(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
          </label>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* System Status Info */}
      <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center space-x-2 text-white font-bold">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>SkillBridge Backend Integration Status</span>
        </div>
        <div className="space-y-1.5 text-slate-400">
          <p>• <strong>API Endpoint:</strong> http://localhost:8000/api</p>
          <p>• <strong>Authentication:</strong> JWT (JSON Web Tokens) with Bearer Authorization</p>
          <p>• <strong>AI Career Mentor:</strong> Contextual Expert Rules Engine + Gemini API Integration</p>
          <p>• <strong>Resume Engine:</strong> PyMuPDF & Python-docx with NLP technical skills dictionary</p>
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from SkillBridge</span>
        </button>
      </div>

    </div>
  );
}
