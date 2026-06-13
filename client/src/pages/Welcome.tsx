import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { ErrorBanner, Screen } from '../components/ui';

export default function Welcome() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') await signup(name, email, password);
      else await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen nav={false}>
      <div style={{ textAlign: 'center', margin: '24px 0 26px' }}>
        <div style={{ fontSize: 52 }}>🧭</div>
        <h1 className="brand-title">Wonder</h1>
        <p className="muted" style={{ marginTop: 4 }}>
          Stop wondering what to do. Get three ready-to-go plans — food and fun — for solo time,
          friends, or date night.
        </p>
      </div>

      <div className="toggle-row" style={{ marginBottom: 18 }}>
        <button
          className={`toggle ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => setMode('signup')}
        >
          Create account
        </button>
        <button
          className={`toggle ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
        >
          Log in
        </button>
      </div>

      <form onSubmit={submit}>
        <ErrorBanner message={error} />
        {mode === 'signup' && (
          <div className="field">
            <label>Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex"
              required
              autoComplete="name"
            />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
            required
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>
        <div className="spacer" />
        <button className="btn" disabled={busy}>
          {busy ? 'Just a sec…' : mode === 'signup' ? 'Create my account' : 'Log in'}
        </button>
      </form>

      <p className="faint center" style={{ marginTop: 18 }}>
        {mode === 'signup'
          ? 'Next, a quick interest survey so your plans feel personal.'
          : 'Welcome back! Let’s find your next plan.'}
      </p>
    </Screen>
  );
}
