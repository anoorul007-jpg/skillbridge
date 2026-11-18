import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// 20 Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import CareerSelectionPage from './pages/CareerSelectionPage';
import SkillGapAnalysisPage from './pages/SkillGapAnalysisPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';
import ProjectRecommendationsPage from './pages/ProjectRecommendationsPage';
import TechnicalAssessmentsPage from './pages/TechnicalAssessmentsPage';
import AssessmentRunnerPage from './pages/AssessmentRunnerPage';
import AICareerMentorPage from './pages/AICareerMentorPage';
import JobPortalPage from './pages/JobPortalPage';
import ApplicationTrackingPage from './pages/ApplicationTrackingPage';
import MentorDashboardPage from './pages/MentorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            
            {/* 1. Public Marketing & Auth Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* 2. Student Core Dashboard & Discovery */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 3. Resume Analyzer */}
            <Route
              path="/resume-analyzer"
              element={
                <ProtectedRoute>
                  <ResumeAnalyzerPage />
                </ProtectedRoute>
              }
            />

            {/* 4. Career Selection & Skill Gap Analysis */}
            <Route path="/careers" element={<CareerSelectionPage />} />
            <Route
              path="/skill-gap"
              element={
                <ProtectedRoute>
                  <SkillGapAnalysisPage />
                </ProtectedRoute>
              }
            />

            {/* 5. Roadmap & Projects */}
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <LearningRoadmapPage />
                </ProtectedRoute>
              }
            />
            <Route path="/projects" element={<ProjectRecommendationsPage />} />

            {/* 6. Technical Assessments */}
            <Route path="/assessments" element={<TechnicalAssessmentsPage />} />
            <Route
              path="/assessments/:id"
              element={
                <ProtectedRoute>
                  <AssessmentRunnerPage />
                </ProtectedRoute>
              }
            />

            {/* 7. AI Career Mentor Chatbot */}
            <Route
              path="/ai-mentor"
              element={
                <ProtectedRoute>
                  <AICareerMentorPage />
                </ProtectedRoute>
              }
            />

            {/* 8. Internship & Job Portal */}
            <Route path="/jobs" element={<JobPortalPage />} />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <ApplicationTrackingPage />
                </ProtectedRoute>
              }
            />

            {/* 9. Mentor Dashboard */}
            <Route
              path="/mentor-dashboard"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'STUDENT', 'ADMIN']}>
                  <MentorDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 10. Admin Dashboard */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 11. Notifications & Settings */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
