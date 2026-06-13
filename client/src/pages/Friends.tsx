import { useEffect, useState } from 'react';
import { api, Connection } from '../lib/api';
import { useAuth } from '../lib/auth';
import { ErrorBanner, Loader, Screen, initials } from '../components/ui';

export default function Friends() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [code, setCode] = useState('');
  const [relation, setRelation] = useState<'friend' | 'partner'>('friend');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    const r = await api.connections();
    setConnections(r.connections);
  }
  useEffect(() => {
    load().catch(() => setConnections([]));
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      const r = await api.connect({ shareCode: code.trim(), relation });
      setMsg(`Connected with ${r.person.name}! Their tastes will factor into your plans.`);
      setCode('');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  }

  async function shareCode() {
    if (!user) return;
    const text = `Add me on Wonder! My code is ${user.shareCode} so we can plan things together.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Wonder', text });
        return;
      } catch {
        /* user cancelled */
      }
    }
    copyCode();
  }

  async function remove(id: string) {
    if (!confirm('Remove this connection?')) return;
    await api.removeConnection(id);
    await load();
  }

  return (
    <Screen>
      <div className="screen-head">
        <span className="eyebrow">Your people</span>
        <h1>Friends & partner</h1>
        <p>Connect so Wonder can blend everyone’s interests into date and group plans.</p>
      </div>

      <div className="card" style={{ background: 'var(--grad-soft)' }}>
        <div className="faint">Your invite code</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.18em' }}>
            {user?.shareCode}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn small secondary" onClick={copyCode}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button className="btn small" onClick={shareCode}>
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="section-title">Add someone</div>
      <form onSubmit={add} className="card">
        <ErrorBanner message={error} />
        {msg && <div className="success-banner">{msg}</div>}
        <div className="field">
          <label>Their invite code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. 6DTB2C"
            autoCapitalize="characters"
          />
        </div>
        <div className="toggle-row" style={{ marginBottom: 14 }}>
          <button
            type="button"
            className={`toggle ${relation === 'friend' ? 'active' : ''}`}
            onClick={() => setRelation('friend')}
          >
            🙂 Friend
          </button>
          <button
            type="button"
            className={`toggle ${relation === 'partner' ? 'active' : ''}`}
            onClick={() => setRelation('partner')}
          >
            💕 Partner
          </button>
        </div>
        <button className="btn" disabled={busy || code.length < 4}>
          {busy ? 'Connecting…' : 'Connect'}
        </button>
      </form>

      <div className="section-title">Connected ({connections?.length ?? 0})</div>
      {!connections ? (
        <Loader />
      ) : connections.length === 0 ? (
        <div className="empty">
          <div className="big">👋</div>
          <p>No connections yet. Share your code to get started.</p>
        </div>
      ) : (
        <div className="card">
          {connections.map((c) => (
            <div key={c.id} className="list-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar">{initials(c.person.name)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{c.person.name}</div>
                  <div className="faint">
                    {c.relation === 'partner' ? '💕 Partner' : '🙂 Friend'}
                    {!c.person.hasProfile && ' · hasn’t done survey'}
                  </div>
                </div>
              </div>
              <button className="btn small ghost" onClick={() => remove(c.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
