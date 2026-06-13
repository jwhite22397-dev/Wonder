import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { api, GenerateResult } from '../lib/api';
import { BackButton, ErrorBanner, Screen } from '../components/ui';
import { ItineraryView } from '../components/Itinerary';

const MODE_LABEL: Record<string, string> = { solo: 'Solo day', friends: 'Friends hangout', date: 'Date' };

function prettyDate(d?: string) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as any)?.result as GenerateResult | undefined;

  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!result) return <Navigate to="/" replace />;

  const { itineraries, request, participants } = result;
  const current = itineraries[selected];
  const who = participants.map((p) => (p.you ? 'You' : p.name)).join(' & ');

  async function choose() {
    setBusy(true);
    setError(null);
    try {
      const title = `${current.title} · ${MODE_LABEL[request.mode]}${request.date ? ' · ' + prettyDate(request.date) : ''}`;
      const { plan } = await api.savePlan({
        mode: request.mode,
        title,
        request: { ...request, _participants: participants },
        itinerary: current,
      });
      navigate(`/plan/${plan.id}`, { state: { justSaved: true } });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen nav={false}>
      <BackButton to="/" label="Edit plan" />
      <div className="screen-head">
        <span className="eyebrow">{MODE_LABEL[request.mode]} · {who}</span>
        <h1>Pick your favorite</h1>
        <p>
          {request.location.label} · within {request.radiusMi} mi · up to ${request.budgetPerPerson}/person
          {request.date ? ` · ${prettyDate(request.date)}` : ''}
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="mode-grid" style={{ gridTemplateColumns: `repeat(${itineraries.length}, 1fr)` }}>
        {itineraries.map((it, i) => (
          <button
            key={it.key}
            className={`mode-card ${selected === i ? 'active' : ''}`}
            onClick={() => setSelected(i)}
          >
            <div className="emoji">{it.emoji}</div>
            <div className="label">{it.title.replace('The ', '')}</div>
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>{current.emoji}</span>
          <div>
            <h3>{current.title}</h3>
            <div className="faint">{current.blurb}</div>
          </div>
        </div>
        {!current.summary.withinBudget && (
          <div className="error-banner" style={{ marginTop: 10 }}>
            Heads up: this one runs a little over your budget.
          </div>
        )}
        <div className="spacer" />
        <ItineraryView it={current} />
      </div>

      <div className="spacer" />
      <button className="btn" onClick={choose} disabled={busy}>
        {busy ? 'Saving…' : `💖 Choose “${current.title}”`}
      </button>
      <div className="spacer" />
    </Screen>
  );
}
