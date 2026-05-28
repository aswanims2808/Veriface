import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import DetectPage from './pages/DetectPage';
import BatchDetectPage from './pages/BatchDetectPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import Results from './components/Results';
import SharedResult from './components/SharedResult';
import { AuthenticatedLayout, PublicLayout } from './components/layout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing Page as entry point */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* Public Pages (Still keeping them accessible if needed, but main entry is dashboard) */}
          <Route
            path="/pricing"
            element={
              <PublicLayout>
                <PricingPage />
              </PublicLayout>
            }
          />
          <Route
            path="/how-it-works"
            element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            }
          />
          <Route
            path="/features"
            element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            }
          />

          {/* Legacy Auth Routes Redirects */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />

          {/* App Routes (Authenticated Layout) */}
          <Route
            path="/dashboard"
            element={
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/detect"
            element={
              <AuthenticatedLayout>
                <DetectPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/detect/batch"
            element={
              <AuthenticatedLayout>
                <BatchDetectPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthenticatedLayout>
                <SettingsPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <AuthenticatedLayout>
                <AnalyticsPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/history"
            element={
              <AuthenticatedLayout>
                <HistoryPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/results/:id"
            element={
              <AuthenticatedLayout>
                <Results />
              </AuthenticatedLayout>
            }
          />

          {/* Public Shared Results */}
          <Route path="/shared/:token" element={<SharedResult />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
