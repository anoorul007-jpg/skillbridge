import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'MENTOR') navigate('/mentor-dashboard');
      else if (user.role === 'ADMIN') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginAsDemo(role);
      if (role === 'MENTOR') navigate('/mentor-dashboard');
      else if (role === 'ADMIN') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in with demo account. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to your SkillBridge account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-800 text-center">
            One-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('STUDENT')}
              disabled={loading}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-xs transition-colors"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('MENTOR')}
              disabled={loading}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-xs transition-colors"
            >
              💼 Mentor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              disabled={loading}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-xs transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@skillbridge.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
