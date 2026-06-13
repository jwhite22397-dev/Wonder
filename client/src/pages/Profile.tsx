import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { ErrorBanner, Screen, initials } from '../components/ui';

const PRESET_CITIES = [
  { label: 'New York, NY', lat: 40.7128, lng: -74.006 },
  { label: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { label: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { label: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { label: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
  { label: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
  { label: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { label: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
];

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!user) return null;
  const interestCount = user.profile?.tags ? Object.keys(user.profile.tags).length : 0;

  async function setHomeCity(label: string) {
    const city = PRESET_CITIES.find((c) => c.label === label);
    if (!city) return;
    try {
      const { user } = await api.setHome({ lat: city.lat, lng: city.lng, label: city.label });
      setUser(user);
      setMsg(`Home set to ${city.label}.`);
      setTimeout(() => setMsg(null), 1800);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function useGps() {
    if (!navigator.geolocation) {
      setError('Location services are not available.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { user } = await api.setHome({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'My location',
          });
          setUser(user);
          setMsg('Home set to your current location.');
          setTimeout(() => setMsg(null), 1800);
        } catch (e: any) {
          setError(e.message);
        }
      },
      () => setError('Could not get your location.')
    );
  }

  return (
    <Screen>
      <div className="screen-head">
        <span className="eyebrow">Your account</span>
        <h1>Profile</h1>
      </div>

      <ErrorBanner message={error} />
      {msg && <div className="success-banner">{msg}</div>}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
            {initials(user.name)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{user.name}</div>
            <div className="faint">{user.email}</div>
            <div className="faint">Invite code: <b>{user.shareCode}</b></div>
          </div>
        </div>
      </div>

      <div className="section-title">Interests</div>
      <div className="card choice-card" onClick={() => navigate('/survey')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26 }}>🎯</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Your interest survey</div>
            <div className="faint">{interestCount} interests selected · tap to edit</div>
          </div>
          <span className="muted">›</span>
        </div>
      </div>

      <div className="section-title">Home base</div>
      <div className="card">
        <p className="faint" style={{ marginTop: 0 }}>
          Sets the default starting point for new plans.
        </p>
        <div className="field">
          <select
            value={PRESET_CITIES.find((c) => c.label === user.home?.label)?.label || ''}
            onChange={(e) => setHomeCity(e.target.value)}
          >
            <option value="" disabled>
              {user.home?.label || 'Choose a city'}
            </option>
            {PRESET_CITIES.map((c) => (
              <option key={c.label} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn secondary" onClick={useGps}>
          📍 Use my current location
        </button>
      </div>

      <div className="spacer" />
      <button className="btn ghost" onClick={() => navigate('/friends')}>
        👥 Manage friends & partner
      </button>
      <div className="spacer" />
      <button
        className="btn danger"
        onClick={() => {
          logout();
          navigate('/welcome');
        }}
      >
        Log out
      </button>
      <p className="faint center" style={{ marginTop: 20 }}>
        Wonder · plan less, do more
      </p>
    </Screen>
  );
}
