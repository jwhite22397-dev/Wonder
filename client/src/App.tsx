import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { BottomNav, Loader } from './components/ui';
import Welcome from './pages/Welcome';
import Survey from './pages/Survey';
import Home from './pages/Home';
import Results from './pages/Results';
import Saved from './pages/Saved';
import PlanDetail from './pages/PlanDetail';
import Friends from './pages/Friends';
import Profile from './pages/Profile';

function hasProfile(user: any) {
  return !!(user?.profile?.tags && Object.keys(user.profile.tags).length > 0);
}

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-shell">
        <Loader label="Warming up…" />
      </div>
    );
  }

  // Not logged in: only auth screens.
  if (!user) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </div>
    );
  }

  // Logged in but hasn't done the interest survey yet: force onboarding.
  if (!hasProfile(user) && location.pathname !== '/survey') {
    return <Navigate to="/survey" replace state={{ onboarding: true }} />;
  }

  const showNav = !['/survey'].includes(location.pathname) && !location.pathname.startsWith('/results');

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/plan/:id" element={<PlanDetail />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}
