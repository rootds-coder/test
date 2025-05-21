import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import LandingPage from './components/home/LandingPage';
import AboutUs from './pages/about/AboutUs';
import Projects from './pages/projects/Projects';
import GetInvolved from './pages/get-involved/GetInvolved';
import SuccessStories from './pages/success-stories/SuccessStories';
import FAQ from './pages/faq/FAQ';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import Donate from './pages/donate/Donate';
import NewsDetail from './pages/news/NewsDetail';
import ScrollToTop from './components/shared/ScrollToTop';
import { darkTheme } from './theme/darkTheme';
import useSmoothScroll from './hooks/useSmoothScroll';

const App: React.FC = () => {
  // Initialize smooth scrolling
  useSmoothScroll();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if admin is logged in
  const isAdminLoggedIn = () => {
    return localStorage.getItem('adminToken') !== null;
  };

  // Protected Route component
  const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAdminLoggedIn()) {
      return <Navigate to="/admin/login" />;
    }
    return <>{children}</>;
  };

  // Redirect from admin login if already logged in
  const AdminLoginRedirect = () => {
    useEffect(() => {
      if (isAdminLoggedIn()) {
        navigate('/admin/dashboard');
      }
    }, [navigate]);

    return <AdminLogin />;
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Routes>
          {/* Admin routes - these should be separate from public routes */}
          <Route path="/admin/login" element={<AdminLoginRedirect />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route path="/admin" element={<Navigate to="/admin/login" />} />
          
          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <>
                <Navigation />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/get-involved" element={<GetInvolved />} />
                  <Route path="/success-stories" element={<SuccessStories />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                </Routes>
                <Footer />
                <ScrollToTop />
              </>
            }
          />
          
          {/* Add a catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
