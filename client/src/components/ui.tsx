import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export function Screen({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return <div className={`screen ${nav ? '' : 'no-nav'}`}>{children}</div>;
}

export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loader">
      <div className="spinner" />
      <div>{label}</div>
    </div>
  );
}

export function BackButton({ to, label = 'Back' }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <button className="back-btn" onClick={() => (to ? navigate(to) : navigate(-1))}>
      ‹ {label}
    </button>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return <div className="error-banner">{message}</div>;
}

const NAV = [
  { to: '/', ic: '🧭', label: 'Plan', end: true },
  { to: '/saved', ic: '📒', label: 'Saved' },
  { to: '/friends', ic: '👥', label: 'People' },
  { to: '/profile', ic: '😊', label: 'You' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="ic">{n.ic}</span>
          <span>{n.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
