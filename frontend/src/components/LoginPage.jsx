import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/home-hero.jpg';

export default function LoginPage() {
  const { session, logIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await logIn({ email, password });
      } else {
        await signUp({ name, email, password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--paper)' }}>
      {/* Marketing panel */}
      <div
        className="stripe-fill"
        style={{
          flex: 1,
          minWidth: 0,
          borderRight: 'var(--bw) var(--bs) var(--ink)',
          padding: '24px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
          <div
            style={{
              width: 52,
              height: 52,
              flex: 'none',
              border: 'var(--bw) var(--bs) var(--ink)',
              borderRadius: '50%',
              background: 'var(--brand)',
            }}
          />
          <span style={{ fontSize: 38 }}>
            <span style={{ color: 'var(--brand)', fontWeight: 700 }}>PIG</span> Bank
          </span>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
          <span style={{ fontSize: 40, lineHeight: 1.15 }}>Your money. Every move. Zero mystery.</span>
          <span style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.5 }}>
            Stashes for spending and stashes for saving. Shove money around in two clicks and see
            exactly what's left every single time.
          </span>
        </div>

        <div
          style={{
            marginTop: 22,
            marginBottom: 26,
            flex: 1,
            minHeight: 200,
            border: 'var(--bw) var(--bs) var(--ink)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            background: 'var(--paper)',
          }}
        >
          <img
            src={heroImage}
            alt="Parents lifting their laughing kid in the air"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 42%', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 22, fontSize: 15, color: 'var(--muted)' }}>
          <span>FDIC placeholder</span>
          <span>256-bit encryption</span>
          <span>Zero sneaky fees</span>
        </div>
      </div>

      {/* Login / signup box */}
      <div
        style={{
          width: 480,
          flex: 'none',
          padding: '24px 46px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 26 }}>{mode === 'login' ? "Hey, you're back!" : 'Make a stash of your own'}</span>
          <span style={{ fontSize: 16, color: 'var(--muted)' }}>
            {mode === 'login' ? "Pop in your email and we'll go find your money." : "Two minutes, no paperwork."}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card"
          style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {mode === 'signup' && (
            <Field label="Your name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amara Okafor"
                style={inputStyle}
              />
            </Field>
          )}

          <Field label="Your email">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amara@mail.com"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>Secret word</span>
              {mode === 'login' && <span style={{ fontSize: 14, color: 'var(--accent)', cursor: 'pointer' }}>Forgot it?</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={{ ...inputStyle, flex: 1 }}
              />
              <span
                onClick={() => setShowPassword((v) => !v)}
                style={{ fontSize: 14, color: 'var(--muted)', cursor: 'pointer', flex: 'none' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ textAlign: 'center' }}>
            {submitting ? 'One sec…' : mode === 'login' ? 'Let me in!' : "Let's go"}
          </button>

          {error && (
            <div
              style={{
                border: 'var(--bw) var(--bs) var(--neg)',
                borderRadius: 'var(--r-sm)',
                padding: '11px 14px',
                fontSize: 15,
                color: 'var(--neg)',
              }}
            >
              {error}
            </div>
          )}
        </form>

        <div style={{ fontSize: 16, color: 'var(--muted)', textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              No stash yet?{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => { setMode('signup'); setError(''); }}>
                Make one, it's quick
              </span>
            </>
          ) : (
            <>
              Already have a stash?{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => { setMode('login'); setError(''); }}>
                Log in instead
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 15, color: 'var(--muted)' }}>{label}</span>
      {children}
    </div>
  );
}

const inputStyle = {
  border: 'var(--bw) var(--bs) var(--ink)',
  borderRadius: 'var(--r-sm)',
  padding: '13px 14px',
  fontSize: 17,
  width: '100%',
  background: 'var(--paper)',
};
