import { type FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { InstitutionLoginPage } from './pages/InstitutionLoginPage';
import { InstitutionDashboard } from './components/institution/InstitutionDashboard';
import './App.css';

export const App: FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Gateway */}
          <Route path="/login" element={<Navigate to="/institution/login" replace />} />
          <Route path="/institution/login" element={<InstitutionLoginPage />} />

          {/* Protected Institutional Portal Routes */}
          <Route
            path="/institution"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/pulse"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/structure"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/documents"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/staff"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
