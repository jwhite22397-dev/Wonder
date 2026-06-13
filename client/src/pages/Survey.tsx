import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, Taxonomy, Profile } from '../lib/api';
import { useAuth } from '../lib/auth';
import { BackButton, ErrorBanner, Loader, Screen } from '../components/ui';

const LEVEL_LABELS = ['', 'Like', 'Love', 'Obsessed'];

export default function Survey() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onboarding = (location.state as any)?.onboarding;

  const [tax, setTax] = useState<Taxonomy | null>(null);
  const [tags, setTags] = useState<Record<string, number>>(user?.profile?.tags || {});
  const [vibes, setVibes] = useState(user?.profile?.vibes || { pace: 0.5, social: 0.5, novelty: 0.5 });
  const [dietary, setDietary] = useState<string[]>(user?.profile?.dietary || []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.taxonomy().then(setTax).catch((e) => setError(e.message));
  }, []);

  const chosenCount = useMemo(
    () => Object.values(tags).filter((v) => v > 0).length,
    [tags]
  );

  function cycle(tagId: string) {
    setTags((prev) => {
      const next = ((prev[tagId] || 0) + 1) % 4;
      const copy = { ...prev };
      if (next === 0) delete copy[tagId];
      else copy[tagId] = next;
      return copy;
    });
  }

  function toggleDiet(id: string) {
    setDietary((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  async function save() {
    if (chosenCount < 3) {
      setError('Pick at least 3 interests so we can tailor your plans.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const profile: Profile = { tags, vibes, dietary };
      const { user } = await api.saveProfile(profile);
      setUser(user);
      navigate('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!tax) return <Screen nav={false}><Loader label="Loading the survey…" /></Screen>;

  return (
    <Screen nav={false}>
      {!onboarding && <BackButton to="/profile" />}
      <div className="screen-head">
        <span className="eyebrow">{onboarding ? 'Step 1 of 1' : 'Your interests'}</span>
        <h1>What are you into?</h1>
        <p>Tap to add — tap again for Love or Obsessed. The more you tell us, the better the plans.</p>
      </div>

      <ErrorBanner message={error} />

      {tax.groups.map((group) => (
        <div key={group.id} style={{ marginBottom: 22 }}>
          <div className="section-title" style={{ marginTop: 6 }}>{group.label}</div>
          <p className="faint" style={{ marginTop: -4, marginBottom: 10 }}>{group.hint}</p>
          <div className="chips">
            {group.tags.map((t) => {
              const level = tags[t.id] || 0;
              return (
                <button
                  key={t.id}
                  className="chip"
                  data-level={level || undefined}
                  onClick={() => cycle(t.id)}
                  type="button"
                >
                  {t.label}
                  {level > 0 && <span className="dot">{'•'.repeat(level)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="section-title">Your vibe</div>
      {tax.vibes.map((v) => (
        <div className="slider-row" key={v.id}>
          <div className="title">{v.label}</div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={(vibes as any)[v.id]}
            onChange={(e) => setVibes({ ...vibes, [v.id]: Number(e.target.value) })}
          />
          <div className="slabels">
            <span>{v.low}</span>
            <span>{v.high}</span>
          </div>
        </div>
      ))}

      <div className="section-title">Dietary preferences</div>
      <div className="chips">
        {tax.dietary.map((d) => (
          <button
            key={d.id}
            type="button"
            className="chip"
            data-level={dietary.includes(d.id) ? 2 : undefined}
            onClick={() => toggleDiet(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="spacer" />
      <div className="spacer" />
      <button className="btn" onClick={save} disabled={busy}>
        {busy ? 'Saving…' : onboarding ? `Done — ${chosenCount} interests` : 'Save changes'}
      </button>
      <p className="faint center" style={{ marginTop: 10 }}>
        {chosenCount} selected · {LEVEL_LABELS.slice(1).join(' / ')} = how much you love it
      </p>
    </Screen>
  );
}
