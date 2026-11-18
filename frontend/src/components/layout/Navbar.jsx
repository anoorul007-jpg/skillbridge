import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import {
  Sparkles, Bell, User, LogOut, ChevronDown,
  Layers, CheckCircle, Shield, Briefcase, Menu, X, ArrowRight
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, loginAsDemo, isAuthenticated, isStudent, isMentor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/analytics/notifications/');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/analytics/notifications/');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoSwitch = async (role) => {
    setSwitching(true);
    setShowDemoMenu(false);
    try {
      await loginAsDemo(role);
      if (role === 'STUDENT') navigate('/dashboard');
      else if (role === 'MENTOR') navigate('/mentor-dashboard');
      else if (role === 'ADMIN') navigate('/admin-dashboard');
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                  Skill<span className="text-sky-600">Bridge</span>
                </span>
                <span className="text-[10px] text-slate-500 -mt-1 font-medium tracking-wide">
                  AI Career & Skills Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links for Public View */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                About Platform
              </Link>
              <Link to="/careers" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                Career Tracks
              </Link>
              <Link to="/jobs" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                Opportunities
              </Link>
            </nav>
          )}

          {/* Right: Actions, Demo Switcher, Notifications & Profile */}
          <div className="flex items-center space-x-3">
            
            {/* 1-Click Demo Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                disabled={switching}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                title="Switch role instantly to test Student, Mentor, and Admin interfaces"
              >
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                <span>{switching ? 'Switching...' : `Role: ${user?.role || 'Guest Demo'}`}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    Quick Role Switcher
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('STUDENT')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center justify-between"
                  >
                    <span>Student (Priya Sharma)</span>
                    {isStudent && <CheckCircle className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('MENTOR')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center justify-between"
                  >
                    <span>Mentor (Alex Rivera)</span>
                    {isMentor && <CheckCircle className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center justify-between"
                  >
                    <span>Administrator</span>
                    {isAdmin && <CheckCircle className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-sky-50/40' : ''}`}
                            >
                              <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-600 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-2 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifDropdown(false)}
                          className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center justify-center space-x-1"
                        >
                          <span>View all notifications</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <img
                      src={user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                      alt={user?.first_name || 'User'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 leading-tight">
                        {user?.first_name || user?.username || 'User'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium capitalize">
                        {user?.role?.toLowerCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{user?.role?.toLowerCase()} Account</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-500/30 transition-all hover:shadow"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
