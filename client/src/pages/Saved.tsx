import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Plan } from '../lib/api';
import { Loader, Screen } from '../components/ui';

const MODE_EMOJI: Record<string, string> = { solo: '🧘', friends: '👯', date: '💕' };

export default function Saved() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    api.plans().then((r) => setPlans(r.plans)).catch(() => setPlans([]));
  }, []);

  if (!plans) return <Screen><Loader /></Screen>;

  return (
    <Screen>
      <div className="screen-head">
        <span className="eyebrow">Your plans</span>
        <h1>Saved itineraries</h1>
      </div>

      {plans.length === 0 ? (
        <div className="empty">
          <div className="big">📒</div>
          <p>No saved plans yet.</p>
          <button className="btn small" onClick={() => navigate('/')}>
            Make your first plan
          </button>
        </div>
      ) : (
        plans.map((p) => (
          <div key={p.id} className="card choice-card" onClick={() => navigate(`/plan/${p.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{MODE_EMOJI[p.mode] || '✨'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                <div className="faint">
                  {p.itinerary.summary.stopCount} stops · ${p.itinerary.summary.estCostPerPerson}/pp ·{' '}
                  {p.request.location?.label}
                </div>
              </div>
              <span className="muted">›</span>
            </div>
          </div>
        ))
      )}
    </Screen>
  );
}
