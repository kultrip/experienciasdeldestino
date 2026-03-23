import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';
import MobileBottomNav from './components/MobileBottomNav';

// Public pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ExperiencesPage = lazy(() => import('./pages/public/ExperiencesPage'));
const ExperienceDetailPage = lazy(() => import('./pages/public/ExperienceDetailPage'));
const ProvincePage = lazy(() => import('./pages/public/ProvincePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SetPasswordPage = lazy(() => import('./pages/auth/SetPasswordPage'));

// Dashboard pages
const CentralDashboard = lazy(() => import('./pages/dashboards/CentralDashboard'));
const DelegadoDashboard = lazy(() => import('./pages/dashboards/DelegadoDashboard'));
const ProductorDashboard = lazy(() => import('./pages/dashboards/ProductorDashboard'));

// Booking flow
const BookingSuccessPage = lazy(() => import('./pages/booking/BookingSuccessPage'));

// Messages (internal)
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router
const DashboardRouter = () => {
  const { profile } = useAuth();

  if (!profile) return <Navigate to="/login" replace />;

  switch (profile.role) {
    case 'central':
      return <CentralDashboard />;
    case 'delegado':
      return <DelegadoDashboard />;
    case 'productor':
      return <ProductorDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/experiencias" element={<ExperiencesPage />} />
        <Route path="/experiencia/:id" element={<ExperienceDetailPage />} />
        <Route path="/provincias/:slug" element={<ProvincePage />} />
        <Route path="/sobre-nosotros" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/set-password" element={<SetPasswordPage />} />

        {/* Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* Internal messages */}
        <Route
          path="/mensajes"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        {/* Booking success */}
        <Route path="/booking/success" element={<BookingSuccessPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <MobileBottomNav />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
