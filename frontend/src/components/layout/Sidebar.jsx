import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, Compass, Target, Map,
  FolderGit2, Award, Bot, Briefcase, Send, Users,
  Shield, Bell, Settings, User, Sparkles, X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isStudent, isMentor, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resume-analyzer', label: 'Resume Analyzer', icon: FileText, badge: 'NLP' },
    { to: '/careers', label: 'Career Selection', icon: Compass },
    { to: '/skill-gap', label: 'Skill Gap Analysis', icon: Target },
    { to: '/roadmap', label: 'Learning Roadmap', icon: Map },
    { to: '/projects', label: 'Practical Projects', icon: FolderGit2 },
    { to: '/assessments', label: 'Technical Tests', icon: Award },
    { to: '/ai-mentor', label: 'AI Career Mentor', icon: Bot, highlight: true },
    { to: '/jobs', label: 'Internships & Jobs', icon: Briefcase },
    { to: '/applications', label: 'Applications', icon: Send },
    { to: '/profile', label: 'Student Profile', icon: User },
  ];

  const mentorLinks = [
    { to: '/mentor-dashboard', label: 'Mentor Hub', icon: Users },
    { to: '/careers', label: 'Career Tracks', icon: Compass },
    { to: '/projects', label: 'Project Bank', icon: FolderGit2 },
    { to: '/jobs', label: 'Job Market', icon: Briefcase },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin-dashboard', label: 'Admin Command', icon: Shield },
    { to: '/careers', label: 'Manage Roles', icon: Compass },
    { to: '/assessments', label: 'Assessments', icon: Award },
    { to: '/jobs', label: 'Manage Jobs', icon: Briefcase },
    { to: '/settings', label: 'Platform Config', icon: Settings },
  ];

  let currentLinks = studentLinks;
  if (isMentor) currentLinks = mentorLinks;
  else if (isAdmin) currentLinks = adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Skill<span className="text-sky-400">Bridge</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Tag */}
        <div className="px-5 py-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-3">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'}
            alt="User"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/50"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {user?.first_name || user?.username || 'User'}
            </p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                {user?.role || 'Guest'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            {isMentor ? 'Mentor Workspace' : isAdmin ? 'Administration' : 'Student Navigation'}
          </div>

          {currentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                      : item.highlight
                      ? 'text-sky-300 hover:bg-slate-800/80 hover:text-sky-200'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 uppercase">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Quick Links */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <NavLink
            to="/notifications"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
