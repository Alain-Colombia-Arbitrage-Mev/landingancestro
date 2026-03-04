import { useState, useEffect, useRef } from 'react';

interface ForgotLabels {
  title: string;
  subtitle: string;
  email: string;
  sendCodeButton: string;
  sending: string;
  backToLogin: string;
}

interface ForgotPasswordFormProps {
  labels: ForgotLabels;
  loginPath: string;
  resetPasswordPath: string;
  lang: string;
}

export default function ForgotPasswordForm({
  labels,
  loginPath,
  resetPasswordPath,
  lang,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    async function init() {
      try {
        const { initAuth } = await import('../../lib/auth-init');
        await initAuth();
      } catch {}
    }
    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setEmailError(false);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      return;
    }

    setIsLoading(true);
    try {
      const { cognitoForgotPassword } = await import('../../lib/auth');
      await cognitoForgotPassword(email);
      window.location.href = `${resetPasswordPath}?email=${encodeURIComponent(email)}`;
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setError(getAuthErrorMessage(err, lang));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fp-wrapper">
      <div className="fp-glow fp-glow-1" />
      <div className="fp-glow fp-glow-2" />

      <div className="fp-card">
        <a href="/" className="fp-logo">
          <img src="/logo.svg" alt="Ancestro" width={140} height={28} />
        </a>

        <div className="fp-header">
          <div className="fp-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>
          <h1 className="fp-title">{labels.title}</h1>
          <p className="fp-subtitle">{labels.subtitle}</p>
        </div>

        {error && (
          <div className="fp-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="fp-form" noValidate>
          <div className={`fp-field ${emailError ? 'fp-field--error' : ''}`}>
            <label className="fp-label" htmlFor="fp-email">{labels.email}</label>
            <div className="fp-input-wrap">
              <svg className="fp-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                ref={emailRef}
                id="fp-email"
                type="email"
                className="fp-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
                autoComplete="email"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`fp-btn fp-btn--primary ${isLoading ? 'fp-btn--loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <><span className="fp-spinner" />{labels.sending}</>
            ) : labels.sendCodeButton}
          </button>
        </form>

        <p className="fp-link-row">
          <a href={loginPath} className="fp-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {labels.backToLogin}
          </a>
        </p>
      </div>

      <style>{`
        .fp-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 100px 20px 40px;
          position: relative;
          overflow: hidden;
        }

        .fp-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .fp-glow-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.12) 0%, transparent 70%);
          top: -100px; right: -100px;
          animation: fpFloat 8s ease-in-out infinite;
        }

        .fp-glow-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.07) 0%, transparent 70%);
          bottom: -80px; left: -80px;
          animation: fpFloat 10s ease-in-out infinite reverse;
        }

        @keyframes fpFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .fp-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 44px 40px;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(248,176,59,0.04);
          animation: fpFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fpFadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

        .fp-logo { display:flex; justify-content:center; margin-bottom:32px; text-decoration:none; }
        .fp-logo img { height:30px; width:auto; object-fit:contain; }

        .fp-header { text-align:center; margin-bottom:32px; }

        .fp-icon-wrap {
          width: 64px; height: 64px;
          margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(248, 176, 59, 0.1);
          border: 1px solid rgba(248, 176, 59, 0.25);
          border-radius: 18px;
          color: #f8b03b;
        }

        .fp-title { font-size:26px; font-weight:700; color:#fff; margin:0 0 8px; letter-spacing:-0.5px; }
        .fp-subtitle { font-size:14px; color:rgba(255,255,255,0.45); margin:0; line-height:1.5; }

        .fp-error {
          display:flex; align-items:center; gap:8px;
          background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25);
          border-radius:12px; padding:12px 14px; font-size:13px; color:#f87171;
          margin-bottom:20px;
          animation: fpShake 0.4s cubic-bezier(0.36,0.07,0.19,0.97);
        }
        .fp-error svg { flex-shrink:0; }

        @keyframes fpShake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)}
        }

        .fp-form { display:flex; flex-direction:column; gap:18px; }
        .fp-field { display:flex; flex-direction:column; gap:7px; }
        .fp-label { font-size:13px; font-weight:500; color:rgba(255,255,255,0.55); }
        .fp-input-wrap { position:relative; }

        .fp-input-icon {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          color:rgba(255,255,255,0.3); pointer-events:none; transition:color 0.2s;
        }

        .fp-input {
          width:100%; padding:13px 16px 13px 42px;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09);
          border-radius:12px; color:#fff; font-size:15px; font-family:inherit;
          outline:none; transition:all 0.2s ease; box-sizing:border-box;
        }

        .fp-input:focus {
          border-color:rgba(248,176,59,0.5); background:rgba(248,176,59,0.04);
          box-shadow:0 0 0 3px rgba(248,176,59,0.08);
        }
        .fp-input-wrap:focus-within .fp-input-icon { color:rgba(248,176,59,0.7); }
        .fp-input::placeholder { color:rgba(255,255,255,0.2); }
        .fp-input:disabled { opacity:0.5; cursor:not-allowed; }
        .fp-field--error .fp-input { border-color:rgba(239,68,68,0.4); background:rgba(239,68,68,0.04); }

        .fp-btn {
          width:100%; padding:14px; border:none; border-radius:12px;
          font-size:15px; font-weight:600; font-family:inherit; cursor:pointer;
          transition:all 0.25s ease; display:flex; align-items:center; justify-content:center; gap:10px;
        }

        .fp-btn--primary {
          background:linear-gradient(135deg,#f8b03b 0%,#e9a235 100%); color:#000;
          box-shadow:0 4px 20px rgba(248,176,59,0.25);
        }
        .fp-btn--primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 30px rgba(248,176,59,0.4); }
        .fp-btn--primary:disabled { opacity:0.6; cursor:not-allowed; }

        .fp-spinner {
          width:18px; height:18px; border:2px solid rgba(0,0,0,0.2); border-top-color:#000;
          border-radius:50%; animation:fpSpin 0.7s linear infinite; flex-shrink:0;
        }
        @keyframes fpSpin { to { transform:rotate(360deg); } }

        .fp-link-row { text-align:center; margin-top:24px; }

        .fp-link {
          color:rgba(248,176,59,0.8); font-size:14px; font-weight:500;
          text-decoration:none; transition:color 0.2s;
          display:inline-flex; align-items:center; gap:6px;
        }
        .fp-link:hover { color:#f8b03b; }

        @media (max-width:480px) {
          .fp-card { padding:36px 24px; border-radius:20px; }
          .fp-title { font-size:22px; }
        }
      `}</style>
    </div>
  );
}
