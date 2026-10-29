import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/Chat';
import MoodPage from './pages/Mood';
import PlannerPage from './pages/Planner';
import RecommendationsPage from './pages/Recommendations';
import Login from './pages/Login';
import Signup from './pages/Signup';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-calm-50 text-calm-900">
        <Navbar />
        <main className="max-w-5xl mx-auto px-5 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/mood" element={<MoodPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
