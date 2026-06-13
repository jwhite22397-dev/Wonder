import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, Plan } from '../lib/api';
import { BackButton, Loader, Screen } from '../components/ui';
import { ItineraryView } from '../components/Itinerary';

const MODE_LABEL: Record<string, string> = { solo: 'Solo day', friends: 'Friends hangout', date: 'Date' };

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const justSaved = (location.state as any)?.justSaved;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.plan(id).then((r) => setPlan(r.plan)).catch(() => setNotFound(true));
  }, [id]);

  async function remove() {
    if (!plan) return;
    if (!confirm('Delete this saved plan?')) return;
    await api.deletePlan(plan.id);
    navigate('/saved');
  }

  if (notFound) return <Screen><div className="empty"><div className="big">🤔</div><p>Plan not found.</p></div></Screen>;
  if (!plan) return <Screen><Loader /></Screen>;

  const participants = (plan.request as any)?._participants as { name: string; you: boolean }[] | undefined;
  const who = participants?.map((p) => (p.you ? 'You' : p.name)).join(' & ');

  return (
    <Screen>
      <BackButton to="/saved" label="Saved" />
      {justSaved && <div className="success-banner">Saved! Have a great time. 🎉</div>}
      <div className="screen-head">
        <span className="eyebrow">
          {MODE_LABEL[plan.mode]}
          {who ? ` · ${who}` : ''}
        </span>
        <h1>{plan.itinerary.title}</h1>
        <p>
          {plan.request.location?.label} · within {plan.request.radiusMi} mi · {plan.request.startTime}–
          {plan.request.endTime}
        </p>
      </div>

      <div className="card">
        <ItineraryView it={plan.itinerary} />
      </div>

      <div className="spacer" />
      <button className="btn secondary" onClick={() => navigate('/')}>
        Plan something new
      </button>
      <div className="spacer" />
      <button className="btn danger" onClick={remove}>
        Delete this plan
      </button>
      <div className="spacer" />
    </Screen>
  );
}
