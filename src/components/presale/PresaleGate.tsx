import { useState, useEffect, useRef, useCallback } from 'react';

interface GateLabels {
  title: string;
  subtitle: string;
  tabCode: string;
  tabWhitelist: string;
  codePlaceholder: string;
  verifyCode: string;
  verifying: string;
  emailPlaceholder: string;
  sendOtp: string;
  sending: string;
  otpSent: string;
  verifyOtp: string;
  invalidCode: string;
  notWhitelisted: string;
  invalidOtp: string;
  expiredOtp: string;
  accessGranted: string;
  alreadyVerified: string;
  serverError: string;
  headline?: string;
  clubName?: string;
  spotsLabel?: string;
  spotsOf?: string;
  membersJoined?: string;
  countriesLabel?: string;
  benefit1?: string;
  benefit2?: string;
  benefit3?: string;
  benefit4?: string;
  formName?: string;
  formEmail?: string;
  formCountry?: string;
  formSubmit?: string;
  formSubmitting?: string;
  formDisclaimer?: string;
  successTitle?: string;
  successMsg?: string;
  orUseCode?: string;
  orLogin?: string;
  loginEmail?: string;
  loginPassword?: string;
  loginButton?: string;
  loginLoading?: string;
  loginError?: string;
  loginWithGoogle?: string;
  backToMain?: string;
}

interface PresaleGateProps {
  labels: GateLabels;
  lang: string;
}

const STORAGE_KEY = 'presale:access';

const MEMBER_AVATARS = [
  { code: 'us' }, { code: 'gb' }, { code: 'de' },
  { code: 'br' }, { code: 'co' }, { code: 'mx' },
];

const COUNTRIES = [
  'United States', 'Mexico', 'Colombia', 'Brazil', 'Argentina',
  'Chile', 'Peru', 'Spain', 'Germany', 'United Kingdom',
  'France', 'Italy', 'Canada', 'Japan', 'Australia',
  'India', 'UAE', 'Singapore', 'South Korea', 'Other',
];

const PHONE_CODES = [
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+52', label: '🇲🇽 +52' },
  { code: '+57', label: '🇨🇴 +57' },
  { code: '+55', label: '🇧🇷 +55' },
  { code: '+54', label: '🇦🇷 +54' },
  { code: '+56', label: '🇨🇱 +56' },
  { code: '+51', label: '🇵🇪 +51' },
  { code: '+34', label: '🇪🇸 +34' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+82', label: '🇰🇷 +82' },
  { code: '+506', label: '🇨🇷 +506' },
  { code: '+507', label: '🇵🇦 +507' },
  { code: '+593', label: '🇪🇨 +593' },
];

const PURCHASE_TIERS = [
  '$100 – $500',
  '$500 – $1,000',
  '$1,000 – $2,500',
  '$2,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000+',
];

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch { return null; }
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

function makePresaleToken(email: string): string {
  const payload = { sub: email, exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600 };
  return `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}.presale_access`;
}

export default function PresaleGate({ labels, lang }: PresaleGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [view, setView] = useState<'main' | 'code' | 'login'>('main');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [country, setCountry] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(47);

  const revealContent = useCallback(() => {
    const content = document.getElementById('presale-content');
    if (content) content.style.display = '';
    const gateSection = document.getElementById('presale-gate-section');
    if (gateSection) gateSection.style.display = 'none';
  }, []);

  // Check existing access on mount (presale token OR Cognito session)
  useEffect(() => {
    async function checkAccess() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isTokenValid(stored)) {
        setHasAccess(true);
        revealContent();
        return;
      }
      if (stored) localStorage.removeItem(STORAGE_KEY);

      // Also check if user has an active Cognito session
      try {
        const cognitoUser = localStorage.getItem('ancestro:user');
        if (cognitoUser && cognitoUser !== 'null') {
          const user = JSON.parse(cognitoUser);
          if (user?.email) {
            localStorage.setItem(STORAGE_KEY, makePresaleToken(user.email));
            setHasAccess(true);
            revealContent();
            return;
          }
        }
      } catch { /* ignore */ }

      setHasAccess(false);
    }
    checkAccess();
  }, [revealContent]);

  // Scarcity countdown
  useEffect(() => {
    if (hasAccess !== false) return;
    const interval = setInterval(() => {
      setSpotsLeft(prev => prev <= 12 ? prev : (Math.random() > 0.6 ? prev - 1 : prev));
    }, 15000 + Math.random() * 20000);
    return () => clearInterval(interval);
  }, [hasAccess]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const grantAccess = useCallback((token: string) => {
    localStorage.setItem(STORAGE_KEY, token);
    setSuccess(true);
    setTimeout(() => {
      setHasAccess(true);
      revealContent();
    }, 2000);
  }, [revealContent]);

  const getErrorMessage = useCallback((errorCode: string): string => {
    const map: Record<string, string> = {
      invalid_code: labels.invalidCode,
      not_whitelisted: labels.notWhitelisted,
      invalid_otp: labels.invalidOtp,
      expired_otp: labels.expiredOtp,
      already_verified: labels.alreadyVerified,
      server_error: labels.serverError,
    };
    return map[errorCode] || labels.serverError;
  }, [labels]);

  // --- Handlers ---

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !purchaseAmount || !country) return;
    setError('');
    setIsLoading(true);

    try {
      await fetch('https://formsubmit.co/ajax/invest@ancestro.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `[Presale Club] New Application: ${name}`,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() ? `${phoneCode} ${phone.trim()}` : '',
          purchase_amount: purchaseAmount,
          country,
          source: 'presale-gate',
        }),
      });
      grantAccess(makePresaleToken(email.trim()));
    } catch {
      setError(labels.serverError);
      triggerShake();
      setIsLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/presale/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();

      if (data.success && data.accessToken) {
        grantAccess(data.accessToken);
      } else {
        setError(getErrorMessage(data.error));
        triggerShake();
      }
    } catch {
      setError(labels.serverError);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCognitoLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;
    setError('');
    setIsLoading(true);

    try {
      const { initAuth } = await import('../../lib/auth-init');
      await initAuth();
      const { login } = await import('../../stores/user');
      const result = await login(loginEmail.trim(), loginPassword);

      if (result.success) {
        grantAccess(makePresaleToken(loginEmail.trim()));
      } else if (result.needsNewPassword) {
        const loginPath = lang === 'es' ? '/login' : `/${lang}/login`;
        window.location.href = loginPath;
        return;
      } else if (result.needsVerification) {
        setError(labels.loginError || 'Account not verified. Please check your email.');
        triggerShake();
      } else {
        setError(labels.loginError || 'Invalid credentials');
        triggerShake();
      }
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setError(getAuthErrorMessage(err, lang));
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    try {
      const { initAuth } = await import('../../lib/auth-init');
      await initAuth();
      const { loginWithGoogle } = await import('../../stores/user');
      await loginWithGoogle();
    } catch {
      setError(labels.serverError);
      setIsLoading(false);
    }
  }

  // --- Renders ---

  if (hasAccess === null) {
    return (
      <div style={st.loaderWrap}>
        <div style={st.spinner} />
      </div>
    );
  }

  if (hasAccess) return null;

  if (success) {
    return (
      <div style={st.overlay}>
        <div style={st.noiseTexture} />
        <div style={st.successCard}>
          <div style={st.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 style={st.successTitle}>{labels.successTitle || 'Welcome to the Inner Circle'}</h2>
          <p style={st.successMsg}>{labels.successMsg || 'Your access has been granted. Redirecting...'}</p>
          <div style={st.successBar}><div style={st.successBarFill} /></div>
        </div>
        <style>{animations}</style>
      </div>
    );
  }

  const switchView = (v: 'main' | 'code' | 'login') => { setView(v); setError(''); };

  return (
    <div style={st.overlay}>
      <div style={st.noiseTexture} />
      <div style={st.glowOrb1} />
      <div style={st.glowOrb2} />

      <div style={st.content}>
        {/* ========== MAIN VIEW: Club Application ========== */}
        {view === 'main' && (
          <div style={{ ...st.card, ...(shake ? st.cardShake : {}) }}>
            <div style={st.topBadge}>
              <span style={st.topBadgeDot} />
              <span>{labels.spotsLabel || 'Limited Access'} — {spotsLeft} {labels.spotsOf || 'of 150 spots left'}</span>
            </div>

            <div style={st.logoArea}>
              <img src="/logo.svg" alt="Ancestro" style={st.logo} />
            </div>

            <h1 style={st.headline}>{labels.headline || 'The Ancestro Inner Circle'}</h1>
            <p style={st.subheadline}>{labels.subtitle}</p>

            <div style={st.progressWrap}>
              <div style={st.progressTrack}>
                <div style={{ ...st.progressFill, width: `${((150 - spotsLeft) / 150) * 100}%` }} />
              </div>
              <div style={st.progressLabels}>
                <span style={st.progressJoined}>{150 - spotsLeft} {labels.membersJoined || 'members joined'}</span>
                <span style={st.progressSpots}>{spotsLeft} {labels.spotsOf || 'spots remaining'}</span>
              </div>
            </div>

            <div style={st.socialProof}>
              <div style={st.avatarStack}>
                {MEMBER_AVATARS.map((m, i) => (
                  <div key={i} style={{ ...st.avatar, marginLeft: i > 0 ? '-10px' : '0', zIndex: 10 - i }}>
                    <img src={`https://flagcdn.com/w40/${m.code}.png`} alt="" style={st.flagImg} />
                  </div>
                ))}
                <div style={{ ...st.avatarCount, marginLeft: '-10px', zIndex: 3 }}>
                  <span>+102</span>
                </div>
              </div>
              <span style={st.socialProofText}>{labels.countriesLabel || 'From 23+ countries worldwide'}</span>
            </div>

            <div style={st.benefits}>
              {[
                { icon: '🔒', text: labels.benefit1 || 'Exclusive presale price (33% below listing)' },
                { icon: '⚡', text: labels.benefit2 || 'Priority allocation before public launch' },
                { icon: '🌐', text: labels.benefit4 || 'Direct access to founding team & community' },
              ].map((b, i) => (
                <div key={i} style={st.benefitRow}>
                  <span style={st.benefitIcon}>{b.icon}</span>
                  <span style={st.benefitText}>{b.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} style={st.form}>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={labels.formName || 'Full name'} required autoComplete="name" style={st.input} disabled={isLoading} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={labels.formEmail || 'Email address'} required autoComplete="email" style={st.input} disabled={isLoading} />
              <div style={st.phoneRow}>
                <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} style={{ ...st.input, ...st.phoneCodeSelect }} disabled={isLoading}>
                  {PHONE_CODES.map(p => <option key={p.code} value={p.code} style={{ color: '#f5f0e6', background: '#1a1a16' }}>{p.label}</option>)}
                </select>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9\s\-()]/g, ''))} placeholder={labels.formPhone || '(555) 000-0000'} autoComplete="tel" style={{ ...st.input, flex: 1 }} disabled={isLoading} />
              </div>
              <select value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} required style={{ ...st.input, ...(purchaseAmount ? {} : { color: 'rgba(245,240,230,0.3)' }) }} disabled={isLoading}>
                <option value="" disabled>{labels.formAmount || 'How much do you plan to invest?'}</option>
                {PURCHASE_TIERS.map(t => <option key={t} value={t} style={{ color: '#f5f0e6', background: '#1a1a16' }}>{t}</option>)}
              </select>
              <select value={country} onChange={e => setCountry(e.target.value)} required style={{ ...st.input, ...(country ? {} : { color: 'rgba(245,240,230,0.3)' }) }} disabled={isLoading}>
                <option value="" disabled>{labels.formCountry || 'Select your country'}</option>
                {COUNTRIES.map(c => <option key={c} value={c} style={{ color: '#f5f0e6', background: '#1a1a16' }}>{c}</option>)}
              </select>

              {error && <ErrorMsg text={error} />}

              <button type="submit" disabled={isLoading || !name.trim() || !email.trim() || !purchaseAmount || !country} style={st.submitBtn}>
                {isLoading ? <span style={st.btnSpinner} /> : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    {labels.formSubmit || 'Request Exclusive Access'}
                  </>
                )}
              </button>
            </form>

            <p style={st.disclaimer}>{labels.formDisclaimer || 'Your information is encrypted and never shared.'}</p>

            <div style={st.altActions}>
              <button onClick={() => switchView('login')} style={st.altBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {labels.orLogin || 'Already have an account? Sign in'}
              </button>
              <span style={st.altSep}>·</span>
              <button onClick={() => switchView('code')} style={st.altBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {labels.orUseCode || 'Have an invite code?'}
              </button>
            </div>
          </div>
        )}

        {/* ========== LOGIN VIEW ========== */}
        {view === 'login' && (
          <div style={{ ...st.card, ...(shake ? st.cardShake : {}), maxWidth: '440px' }}>
            <BackButton onClick={() => switchView('main')} label={labels.backToMain || 'Back'} />

            <div style={st.loginIconWrap}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h2 style={{ ...st.headline, fontSize: '22px', marginBottom: '6px' }}>{labels.orLogin || 'Sign in to access'}</h2>
            <p style={{ ...st.subheadline, marginBottom: '24px' }}>{labels.subtitle}</p>

            <form onSubmit={handleCognitoLogin} style={st.form}>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder={labels.loginEmail || 'Email'} required autoComplete="email" style={st.input} disabled={isLoading} />
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder={labels.loginPassword || 'Password'}
                  required
                  autoComplete="current-password"
                  style={{ ...st.input, paddingRight: '48px' }}
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={st.eyeBtn} tabIndex={-1}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {error && <ErrorMsg text={error} />}

              <button type="submit" disabled={isLoading || !loginEmail.trim() || !loginPassword} style={st.submitBtn}>
                {isLoading ? <span style={st.btnSpinner} /> : (labels.loginButton || 'Sign In')}
              </button>
            </form>

            <div style={st.dividerRow}>
              <div style={st.dividerLine} />
              <span style={st.dividerText}>or</span>
              <div style={st.dividerLine} />
            </div>

            <button onClick={handleGoogleLogin} disabled={isLoading} style={st.googleBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{labels.loginWithGoogle || 'Continue with Google'}</span>
            </button>
          </div>
        )}

        {/* ========== CODE VIEW ========== */}
        {view === 'code' && (
          <div style={{ ...st.card, ...(shake ? st.cardShake : {}), maxWidth: '440px' }}>
            <BackButton onClick={() => switchView('main')} label={labels.backToMain || 'Back'} />

            <div style={st.loginIconWrap}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2 style={{ ...st.headline, fontSize: '22px', marginBottom: '6px' }}>{labels.tabCode}</h2>
            <p style={{ ...st.subheadline, marginBottom: '24px' }}>{labels.subtitle}</p>

            <form onSubmit={handleVerifyCode} style={st.form}>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder={labels.codePlaceholder}
                style={{ ...st.input, textAlign: 'center', letterSpacing: '0.15em', fontWeight: 700, fontSize: '18px' }}
                autoComplete="off"
                spellCheck={false}
                disabled={isLoading}
              />

              {error && <ErrorMsg text={error} />}

              <button type="submit" disabled={isLoading || !inviteCode.trim()} style={st.submitBtn}>
                {isLoading ? <span style={st.btnSpinner} /> : labels.verifyCode}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{animations}</style>
    </div>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <div style={st.errorBox}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <span>{text}</span>
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={st.backBtn}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

const animations = `
  @keyframes pgFadeIn {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pgShake {
    0%, 100% { transform: translateX(0); }
    15% { transform: translateX(-8px); }
    30% { transform: translateX(8px); }
    45% { transform: translateX(-6px); }
    60% { transform: translateX(6px); }
    75% { transform: translateX(-3px); }
    90% { transform: translateX(3px); }
  }
  @keyframes pgSpin { to { transform: rotate(360deg); } }
  @keyframes pgGlow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }
  @keyframes pgPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.4); }
    50% { box-shadow: 0 0 0 6px rgba(248,113,113,0); }
  }
  @keyframes pgNoise {
    0% { transform: translate(0,0); }
    10% { transform: translate(-5%,-5%); }
    20% { transform: translate(5%,5%); }
    30% { transform: translate(-5%,5%); }
    40% { transform: translate(5%,-5%); }
    50% { transform: translate(-5%,0); }
    60% { transform: translate(5%,0); }
    70% { transform: translate(0,5%); }
    80% { transform: translate(0,-5%); }
    90% { transform: translate(5%,5%); }
    100% { transform: translate(0,0); }
  }
  @keyframes pgFillBar { from { width: 0; } to { width: 100%; } }
  @keyframes pgSuccessPulse {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const st: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(10,10,8,1) 0%, rgba(6,6,4,1) 100%)',
    padding: '60px 20px 80px', minHeight: 'calc(100vh - 79px)',
    overflow: 'hidden',
  },
  noiseTexture: {
    position: 'absolute', inset: '-50%', width: '200%', height: '200%',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    opacity: 0.5, pointerEvents: 'none', animation: 'pgNoise 8s steps(10) infinite',
  },
  glowOrb1: {
    position: 'absolute', top: '10%', left: '15%', width: '500px', height: '500px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.1) 0%, transparent 70%)',
    filter: 'blur(80px)', pointerEvents: 'none', animation: 'pgGlow 6s ease-in-out infinite',
  },
  glowOrb2: {
    position: 'absolute', bottom: '5%', right: '10%', width: '350px', height: '350px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%)',
    filter: 'blur(60px)', pointerEvents: 'none', animation: 'pgGlow 8s ease-in-out infinite 2s',
  },
  content: { position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center', margin: 'auto 0', padding: '20px 0' },
  card: {
    width: '100%', maxWidth: '480px',
    background: 'linear-gradient(170deg, rgba(28,26,20,0.92) 0%, rgba(14,13,10,0.97) 100%)',
    border: '1px solid rgba(212,160,23,0.15)', borderRadius: '24px',
    padding: '28px 28px 24px', backdropFilter: 'blur(24px)',
    boxShadow: '0 0 100px rgba(212,160,23,0.04), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
    animation: 'pgFadeIn 0.9s cubic-bezier(0.16,1,0.3,1) both',
  },
  cardShake: { animation: 'pgShake 0.6s ease-in-out' },
  topBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    marginBottom: '16px', padding: '7px 14px',
    background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)',
    borderRadius: '100px', fontSize: '12px',
    fontFamily: "'DM Sans', -apple-system, sans-serif", fontWeight: 600,
    color: '#f87171', letterSpacing: '0.02em',
  },
  topBadgeDot: {
    width: '7px', height: '7px', borderRadius: '50%', background: '#f87171',
    boxShadow: '0 0 8px #f87171', animation: 'pgPulse 2s infinite', flexShrink: 0,
  },
  logoArea: { display: 'flex', justifyContent: 'center', marginBottom: '14px' },
  logo: { height: '40px', width: 'auto', opacity: 0.9 },
  headline: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '26px', fontWeight: 400,
    color: '#f5f0e6', textAlign: 'center' as const, margin: '0 0 6px',
    letterSpacing: '-0.02em', lineHeight: 1.2,
  },
  subheadline: {
    fontFamily: "'DM Sans', -apple-system, sans-serif", fontSize: '13px',
    color: 'rgba(245,240,230,0.45)', textAlign: 'center' as const,
    margin: '0 0 18px', lineHeight: 1.5,
  },
  progressWrap: { marginBottom: '14px' },
  progressTrack: {
    width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)',
    borderRadius: '3px', overflow: 'hidden', marginBottom: '8px',
  },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg, #d4a017, #f8b03b)',
    borderRadius: '3px', transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)',
  },
  progressLabels: {
    display: 'flex', justifyContent: 'space-between', fontSize: '11px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  progressJoined: { color: '#d4a017', fontWeight: 600 },
  progressSpots: { color: 'rgba(245,240,230,0.35)', fontWeight: 500 },
  socialProof: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
    padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px',
  },
  avatarStack: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(28,26,20,0.95)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative' as const,
  },
  flagImg: {
    width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block',
  },
  avatarCount: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'rgba(212,160,23,0.15)', border: '2px solid rgba(212,160,23,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: 700, color: '#d4a017',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    position: 'relative' as const,
  },
  socialProofText: {
    fontSize: '12px', fontFamily: "'DM Sans', -apple-system, sans-serif",
    color: 'rgba(245,240,230,0.4)', lineHeight: 1.4,
  },
  benefits: { display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '20px' },
  benefitRow: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px',
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '10px',
  },
  benefitIcon: { fontSize: '18px', flexShrink: 0, width: '28px', textAlign: 'center' as const },
  benefitText: {
    fontSize: '13px', fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 500, color: 'rgba(245,240,230,0.7)', lineHeight: 1.4,
  },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '12px' },
  input: {
    width: '100%', padding: '12px 14px', fontSize: '14px',
    fontFamily: "'DM Sans', -apple-system, sans-serif", color: '#f5f0e6',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const, appearance: 'none' as const,
  },
  phoneRow: {
    display: 'flex', gap: '8px', width: '100%',
  },
  phoneCodeSelect: {
    width: '110px', flexShrink: 0, paddingRight: '6px',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '13px 24px', fontSize: '14px',
    fontFamily: "'DM Sans', -apple-system, sans-serif", fontWeight: 700,
    color: '#0a0a08',
    background: 'linear-gradient(135deg, #d4a017 0%, #f8b03b 50%, #d4a017 100%)',
    backgroundSize: '200% 100%', border: 'none', borderRadius: '14px',
    cursor: 'pointer', transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(212,160,23,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
    minHeight: '46px', marginTop: '2px',
  },
  disclaimer: {
    fontFamily: "'DM Sans', -apple-system, sans-serif", fontSize: '11px',
    color: 'rgba(245,240,230,0.25)', textAlign: 'center' as const,
    lineHeight: 1.5, margin: '0 0 14px',
  },
  altActions: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', flexWrap: 'wrap' as const,
  },
  altBtn: {
    display: 'inline-flex', alignItems: 'center', padding: '8px 12px',
    fontSize: '12px', fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 600, color: 'rgba(212,160,23,0.55)', background: 'none',
    border: '1px dashed rgba(212,160,23,0.12)', borderRadius: '10px',
    cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' as const,
  },
  altSep: { color: 'rgba(255,255,255,0.1)', fontSize: '14px' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
    fontSize: '12px', fontFamily: "'DM Sans', -apple-system, sans-serif",
    color: '#f87171', background: 'rgba(248,113,113,0.06)',
    border: '1px solid rgba(248,113,113,0.12)', borderRadius: '10px',
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
    fontSize: '13px', fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 500, color: 'rgba(245,240,230,0.4)', background: 'none',
    border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px',
  },
  loginIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  eyeBtn: {
    position: 'absolute' as const, right: '14px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(245,240,230,0.35)', padding: '4px', display: 'flex',
  },
  dividerRow: {
    display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0',
  },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' },
  dividerText: {
    fontSize: '12px', fontFamily: "'DM Sans', -apple-system, sans-serif",
    color: 'rgba(245,240,230,0.25)', textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '14px', fontSize: '14px',
    fontFamily: "'DM Sans', -apple-system, sans-serif", fontWeight: 600,
    color: 'rgba(245,240,230,0.8)', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  btnSpinner: {
    display: 'inline-block', width: '20px', height: '20px',
    border: '2px solid rgba(10,10,8,0.2)', borderTopColor: '#0a0a08',
    borderRadius: '50%', animation: 'pgSpin 0.6s linear infinite',
  },
  loaderWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 'calc(100vh - 79px)', background: 'rgba(8,8,6,1)',
  },
  spinner: {
    width: '36px', height: '36px', border: '3px solid rgba(212,160,23,0.15)',
    borderTopColor: '#d4a017', borderRadius: '50%', animation: 'pgSpin 0.8s linear infinite',
  },
  successCard: {
    position: 'relative' as const, zIndex: 1, textAlign: 'center' as const,
    animation: 'pgSuccessPulse 0.8s cubic-bezier(0.16,1,0.3,1) both',
  },
  successIcon: { marginBottom: '20px' },
  successTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '28px',
    fontWeight: 400, color: '#f5f0e6', margin: '0 0 10px',
  },
  successMsg: {
    fontFamily: "'DM Sans', -apple-system, sans-serif", fontSize: '14px',
    color: 'rgba(245,240,230,0.5)', margin: '0 0 28px',
  },
  successBar: {
    width: '200px', height: '3px', background: 'rgba(255,255,255,0.06)',
    borderRadius: '2px', margin: '0 auto', overflow: 'hidden',
  },
  successBarFill: {
    height: '100%', background: 'linear-gradient(90deg, #4ade80, #d4a017)',
    borderRadius: '2px', animation: 'pgFillBar 2s ease-out both',
  },
};
