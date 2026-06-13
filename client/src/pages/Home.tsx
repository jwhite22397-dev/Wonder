import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Connection, PlanRequest } from '../lib/api';
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

const MODES = [
  { id: 'solo', label: 'Solo', emoji: '🧘', blurb: 'A plan just for you.' },
  { id: 'friends', label: 'Friends', emoji: '👯', blurb: 'Hang with the crew.' },
  { id: 'date', label: 'Date', emoji: '💕', blurb: 'Something for two.' },
] as const;

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'solo' | 'friends' | 'date'>('date');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  const [loc, setLoc] = useState<{ lat: number; lng: number; label: string }>(
    user?.home
      ? { lat: user.home.lat, lng: user.home.lng, label: user.home.label || 'Home' }
      : PRESET_CITIES[3]
  );
  const [locating, setLocating] = useState(false);

  const [radiusMi, setRadiusMi] = useState(15);
  const [budget, setBudget] = useState(80);
  const [date, setDate] = useState(todayStr());
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('22:00');
  const [includeFood, setIncludeFood] = useState(true);
  const [includeActs, setIncludeActs] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.connections().then((r) => setConnections(r.connections)).catch(() => {});
  }, []);

  function selectMode(m: 'solo' | 'friends' | 'date') {
    setMode(m);
    if (m === 'solo') setParticipantIds([]);
    if (m === 'date' && participantIds.length > 1) setParticipantIds(participantIds.slice(0, 1));
  }

  function toggleParticipant(id: string) {
    setParticipantIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (mode === 'date') return [id];
      return [...prev, id];
    });
  }

  function onCityChange(value: string) {
    if (value === '__gps__') return useGps();
    if (value === '__home__' && user?.home) {
      setLoc({ lat: user.home.lat, lng: user.home.lng, label: user.home.label || 'Home' });
      return;
    }
    const city = PRESET_CITIES.find((c) => c.label === value);
    if (city) setLoc({ ...city });
  }

  function useGps() {
    if (!navigator.geolocation) {
      setError('Location services are not available on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Current location',
        });
        setLocating(false);
      },
      () => {
        setError('Could not get your location. Pick a city instead.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  async function generate() {
    setError(null);
    if (!includeFood && !includeActs) {
      setError('Pick food, activities, or both.');
      return;
    }
    if (mode !== 'solo' && participantIds.length === 0) {
      setError(mode === 'date' ? 'Choose who your date is with.' : 'Add at least one friend.');
      return;
    }
    if (endTime <= startTime) {
      setError('Your end time needs to be after your start time.');
      return;
    }

    const req: PlanRequest = {
      mode,
      participantIds,
      location: loc,
      radiusMi,
      budgetPerPerson: budget,
      date,
      startTime,
      endTime,
      include: { food: includeFood, activities: includeActs },
    };

    setBusy(true);
    try {
      const result = await api.generate(req);
      navigate('/results', { state: { result } });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const eligible = connections; // everyone connected can be added
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Screen>
      <div className="screen-head">
        <span className="eyebrow">Hey {firstName} 👋</span>
        <h1>What should we do?</h1>
        <p>Answer a few quick things and get three plans to pick from.</p>
      </div>

      <ErrorBanner message={error} />

      <div className="section-title">Who's it for?</div>
      <div className="mode-grid">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`mode-card ${mode === m.id ? 'active' : ''}`}
            onClick={() => selectMode(m.id)}
          >
            <div className="emoji">{m.emoji}</div>
            <div className="label">{m.label}</div>
          </button>
        ))}
      </div>

      {mode !== 'solo' && (
        <>
          <div className="section-title">
            {mode === 'date' ? 'Your date' : 'Who’s coming?'}
          </div>
          {eligible.length === 0 ? (
            <div className="card">
              <p className="muted" style={{ margin: 0 }}>
                You haven’t connected with anyone yet. Add people on the{' '}
                <b onClick={() => navigate('/friends')} style={{ color: 'var(--primary)' }}>
                  People
                </b>{' '}
                tab so Wonder can blend everyone’s tastes.
              </p>
            </div>
          ) : (
            eligible.map((c) => {
              const on = participantIds.includes(c.person.id);
              return (
                <div
                  key={c.person.id}
                  className={`person-toggle ${on ? 'on' : ''}`}
                  onClick={() => toggleParticipant(c.person.id)}
                >
                  <div className="avatar">{initials(c.person.name)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.person.name}</div>
                    <div className="faint">
                      {c.relation === 'partner' ? '💕 partner' : '🙂 friend'}
                      {!c.person.hasProfile && ' · no survey yet'}
                    </div>
                  </div>
                  <div className="check">{on ? '✓' : ''}</div>
                </div>
              );
            })
          )}
        </>
      )}

      <div className="section-title">Where are you starting?</div>
      <div className="field">
        <select
          value={
            loc.label === 'Current location'
              ? '__gps__'
              : PRESET_CITIES.find((c) => c.label === loc.label)?.label || '__home__'
          }
          onChange={(e) => onCityChange(e.target.value)}
        >
          {user?.home && <option value="__home__">🏠 {user.home.label || 'Home'}</option>}
          <option value="__gps__">📍 Use my current location</option>
          {PRESET_CITIES.map((c) => (
            <option key={c.label} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <p className="faint" style={{ marginTop: -6 }}>
        {locating ? 'Finding you…' : `Starting near ${loc.label}`}
      </p>

      <div className="section-title">How far will you travel?</div>
      <div className="slider-row">
        <div className="title">Within {radiusMi} miles</div>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={radiusMi}
          onChange={(e) => setRadiusMi(Number(e.target.value))}
        />
        <div className="slabels">
          <span>1 mi</span>
          <span>100 mi</span>
        </div>
      </div>

      <div className="section-title">Budget per person</div>
      <div className="slider-row">
        <div className="title">{budget === 0 ? 'Free only' : `Up to $${budget}`}</div>
        <input
          type="range"
          min={0}
          max={300}
          step={5}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <div className="slabels">
          <span>$0</span>
          <span>$300+</span>
        </div>
      </div>

      <div className="section-title">When are you free?</div>
      <div className="field">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="row">
        <div className="field">
          <label>From</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="field">
          <label>Until</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <div className="section-title">Include</div>
      <div className="toggle-row">
        <button
          className={`toggle ${includeFood ? 'active' : ''}`}
          onClick={() => setIncludeFood((v) => !v)}
        >
          🍽️ Food
        </button>
        <button
          className={`toggle ${includeActs ? 'active' : ''}`}
          onClick={() => setIncludeActs((v) => !v)}
        >
          🎟️ Activities
        </button>
      </div>

      <div className="spacer" />
      <div className="spacer" />
      <button className="btn" onClick={generate} disabled={busy}>
        {busy ? 'Building your plans…' : '✨ Get 3 plans'}
      </button>
      <div className="spacer" />
    </Screen>
  );
}
