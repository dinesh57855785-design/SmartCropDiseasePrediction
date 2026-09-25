import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PredictPage from './pages/PredictPage';
import DashboardPage from './pages/DashboardPage';
import WeatherPage from './pages/WeatherPage';
import CropGrowthPage from './pages/CropGrowthPage';
import ReportPage from './pages/ReportPage';
import ChatbotPage from './pages/ChatbotPage';
import FarmingPlannerPage from './pages/FarmingPlannerPage';
import ReportHistoryPage from './pages/ReportHistoryPage';
import ImportantThingsPage from './pages/ImportantThingsPage';
import VoiceNavigation from './components/VoiceNavigation';

function App() {
  return (
    // LanguageProvider wraps everything so the selected language (ta / en)
    // chosen on the HomePage is available to every page without re-selection.
    <LanguageProvider>
      {/* AuthProvider wraps everything so user state is shared globally. */}
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Analyzer (unified Leaf + Soil + Water) — primary route */}
            <Route
              path="/analyzer"
              element={
                <ProtectedRoute>
                  <PredictPage />
                </ProtectedRoute>
              }
            />
            {/* Backward compatibility alias */}
            <Route
              path="/predict"
              element={
                <ProtectedRoute>
                  <PredictPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <FarmingPlannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weather"
              element={
                <ProtectedRoute>
                  <WeatherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/growth"
              element={
                <ProtectedRoute>
                  <CropGrowthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-history"
              element={
                <ProtectedRoute>
                  <ReportHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <ChatbotPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/important-things"
              element={
                <ProtectedRoute>
                  <ImportantThingsPage />
                </ProtectedRoute>
              }
            />
            {/* Safe compatibility redirects for legacy routes */}
            <Route path="/soil" element={<Navigate to="/analyzer" replace />} />
            <Route path="/soil-monitoring" element={<Navigate to="/analyzer" replace />} />
            <Route path="/water" element={<Navigate to="/analyzer" replace />} />
            <Route path="/water-quality" element={<Navigate to="/analyzer" replace />} />
          </Routes>
          <VoiceNavigation />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;