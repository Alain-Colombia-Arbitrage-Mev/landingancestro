import { useState, useEffect, useRef } from 'react';

const ACCESS_KEY = 'invest:access';
const VALID_PASSWORD = 'Ancestro.2026#';

export default function InvestGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(ACCESS_KEY) === 'true') {
        setUnlocked(true);
      }
    } catch {}
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!unlocked && !checking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [unlocked, checking]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password === VALID_PASSWORD) {
      try { sessionStorage.setItem(ACCESS_KEY, 'true'); } catch {}
      setUnlocked(true);
    } else {
      setError('Clave incorrecta');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  if (checking) {
    return (
      <div style={s.overlay}>
        <div style={s.spinner} />
        <style>{keyframes}</style>
      </div>
    );
  }

  if (unlocked) return null;

  return (
    <div style={s.overlay}>
      <div style={s.card} className={shaking ? 'gate-shake' : ''}>
        <div style={s.logoWrap}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f8b03b" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 style={s.title}>Acceso Restringido</h2>
        <p style={s.subtitle}>
          Esta sección es exclusiva para inversionistas autorizados.
          Ingresa la clave de acceso para continuar.
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Clave de acceso"
              style={{
                ...s.input,
                borderColor: error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)',
              }}
              autoComplete="off"
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={s.button}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Acceder</span>
          </button>
        </form>

        <p style={s.disclaimer}>
          Si no tienes la clave, contacta al equipo en <a href="mailto:info@ancestro.co" style={s.link}>info@ancestro.co</a>
        </p>
      </div>

      <style>{keyframes}</style>
    </div>
  );
}

const keyframes = `
  @keyframes gateFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes gateSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes gateSpin { to { transform: rotate(360deg); } }
  @keyframes gateShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
  .gate-shake { animation: gateShake 0.5s ease both !important; }
`;

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, rgba(14,13,11,0.97) 0%, rgba(0,0,0,0.99) 100%)',
    padding: '20px',
    animation: 'gateFadeIn 0.3s ease both',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'linear-gradient(165deg, rgba(28,26,22,0.95) 0%, rgba(14,13,11,0.98) 100%)',
    border: '1px solid rgba(248,176,59,0.15)',
    borderRadius: '24px',
    padding: '48px 36px 36px',
    textAlign: 'center' as const,
    boxShadow: '0 0 80px rgba(248,176,59,0.06), 0 32px 64px rgba(0,0,0,0.5)',
    animation: 'gateSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    margin: '0 auto 24px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(248,176,59,0.12), rgba(248,176,59,0.04))',
    border: '1px solid rgba(248,176,59,0.2)',
  },
  title: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    color: '#f5f0e6',
    margin: '0 0 10px',
  },
  subtitle: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '14px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: '1.6',
    margin: '0 0 28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    position: 'relative' as const,
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '2px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    color: '#f5f0e6',
    fontSize: '16px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box' as const,
    textAlign: 'center' as const,
    letterSpacing: '2px',
  },
  error: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '13px',
    color: '#ef4444',
    margin: '0',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #f8b03b 0%, #e9a235 100%)',
    border: 'none',
    borderRadius: '14px',
    color: '#0e0d09',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
  },
  disclaimer: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    marginTop: '24px',
    lineHeight: '1.5',
  },
  link: {
    color: '#f8b03b',
    textDecoration: 'none',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(248,176,59,0.2)',
    borderTopColor: '#f8b03b',
    borderRadius: '50%',
    animation: 'gateSpin 0.7s linear infinite',
  },
};
