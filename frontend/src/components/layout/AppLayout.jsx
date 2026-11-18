import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Public standalone pages that don't need the dashboard sidebar
  const publicPaths = ['/', '/about', '/login', '/register', '/forgot-password'];
  const isPublicPage = publicPaths.includes(location.pathname);

  // If user is logged in and not explicitly on public marketing page, show app dashboard shell
  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex w-full">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 flex flex-col min-w-0 ${showSidebar ? 'lg:pl-0' : ''}`}>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
          {isPublicPage && <Footer />}
        </main>
      </div>
    </div>
  );
}
