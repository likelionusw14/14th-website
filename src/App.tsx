import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import Layout from './shared/ui/Layout';
import LandingPage from './features/home/LandingPage';
import AboutPage from './features/about/AboutPage';
import ProfilePage from './features/profile/ProfilePage';
import LoginPage from './features/auth/login/LoginPage';
import ApplicationPage from './features/application/ApplicationPage';
import ResultPage from './features/application/ResultPage';
import InterviewSchedulePage from './features/application/InterviewSchedulePage';
import AttendancePage from './features/attendance/AttendancePage';
import AdminPage from './features/admin/AdminPage';
import ProjectPage from './features/project/ProjectPage';
import TermsPage from './features/legal/TermsPage';
import PrivacyPage from './features/legal/PrivacyPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }: { children: React.ReactNode; requireRole?: 'BABY_LION' | 'ADMIN' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-deep-navy text-white">로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole === 'ADMIN' && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (requireRole === 'BABY_LION' && user.role !== 'BABY_LION' && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/interview-schedule" element={<InterviewSchedulePage />} />
            <Route path="/application" element={<ApplicationPage />} />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute requireRole="BABY_LION">
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="ADMIN">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireRole="BABY_LION">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
