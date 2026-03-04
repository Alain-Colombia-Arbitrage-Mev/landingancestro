import { useState, useEffect, useRef } from 'react';

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

interface RegisterLabels {
  title: string;
  subtitle: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  registerButton: string;
  registering: string;
  orContinueWith: string;
  googleLogin: string;
  hasAccount: string;
  login: string;
  passwordsNoMatch: string;
  showPassword: string;
  hidePassword: string;
}

interface RegisterFormProps {
  labels: RegisterLabels;
  loginPath: string;
  verifyPath: string;
  dashboardPath: string;
  lang: string;
}

export default function RegisterForm({
  labels,
  loginPath,
  verifyPath,
  dashboardPath,
  lang,
}: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();

    async function initAndCheck() {
      try {
        const { initAuth } = await import('../../lib/auth-init');
        await initAuth();
        const { currentUser } = await import('../../stores/user');
        if (currentUser.get()) {
          window.location.href = dashboardPath;
        }
      } catch {}
    }
    initAndCheck();
  }, [dashboardPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const errors = {
      name: !name.trim(),
      email: !email || !/\S+@\S+\.\S+/.test(email),
      password: !password || password.length < 8,
      confirmPassword: !confirmPassword || confirmPassword !== password,
    };
    setFieldErrors(errors);

    if (errors.name || errors.email || errors.password) return;

    if (errors.confirmPassword) {
      setError(labels.passwordsNoMatch);
      return;
    }

    setIsLoading(true);
    try {
      const { cognitoSignUp } = await import('../../lib/auth');
      const fullPhone = phone.trim() ? `${phoneCode}${phone.trim()}` : undefined;
      await cognitoSignUp(email, password, name, fullPhone);
      window.location.href = `${verifyPath}?email=${encodeURIComponent(email)}`;
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setError(getAuthErrorMessage(err, lang));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    setError('');
    try {
      const { loginWithGoogle } = await import('../../stores/user');
      await loginWithGoogle();
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setError(getAuthErrorMessage(err, lang));
      setIsGoogleLoading(false);
    }
  }

  function clearFieldError(field: keyof typeof fieldErrors) {
    setFieldErrors((f) => ({ ...f, [field]: false }));
  }

  const EyeOpen = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeClosed = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
    </svg>
  );

  return (
    <div className="rf-wrapper">
      <div className="rf-glow rf-glow-1" />
      <div className="rf-glow rf-glow-2" />

      <div className="rf-card">
        <a href="/" className="rf-logo">
          <img src="/logo.svg" alt="Ancestro" width={140} height={28} />
        </a>

        <div className="rf-header">
          <h1 className="rf-title">{labels.title}</h1>
          <p className="rf-subtitle">{labels.subtitle}</p>
        </div>

        {error && (
          <div className="rf-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rf-form" noValidate>
          {/* Name */}
          <div className={`rf-field ${fieldErrors.name ? 'rf-field--error' : ''}`}>
            <label className="rf-label" htmlFor="rf-name">{labels.name}</label>
            <div className="rf-input-wrap">
              <svg className="rf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                ref={nameRef}
                id="rf-name"
                type="text"
                className="rf-input"
                value={name}
                onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                autoComplete="name"
                placeholder="Tu nombre"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className={`rf-field ${fieldErrors.email ? 'rf-field--error' : ''}`}>
            <label className="rf-label" htmlFor="rf-email">{labels.email}</label>
            <div className="rf-input-wrap">
              <svg className="rf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="rf-email"
                type="email"
                className="rf-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                autoComplete="email"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="rf-field">
            <label className="rf-label" htmlFor="rf-phone">{labels.phone}</label>
            <div className="rf-phone-row">
              <select
                className="rf-input rf-phone-code"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                disabled={isLoading}
              >
                {PHONE_CODES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
              </select>
              <div className="rf-input-wrap" style={{ flex: 1 }}>
                <svg className="rf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  id="rf-phone"
                  type="tel"
                  className="rf-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s\-()]/g, ''))}
                  autoComplete="tel"
                  placeholder="300 000 0000"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className={`rf-field ${fieldErrors.password ? 'rf-field--error' : ''}`}>
            <label className="rf-label" htmlFor="rf-password">{labels.password}</label>
            <div className="rf-input-wrap">
              <svg className="rf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="rf-password"
                type={showPassword ? 'text' : 'password'}
                className="rf-input rf-input--password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                autoComplete="new-password"
                placeholder="Min. 8 caracteres"
                disabled={isLoading}
              />
              <button type="button" className="rf-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? labels.hidePassword : labels.showPassword}>
                {showPassword ? EyeClosed : EyeOpen}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={`rf-field ${fieldErrors.confirmPassword ? 'rf-field--error' : ''}`}>
            <label className="rf-label" htmlFor="rf-confirm">{labels.confirmPassword}</label>
            <div className="rf-input-wrap">
              <svg className="rf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="rf-confirm"
                type={showConfirm ? 'text' : 'password'}
                className="rf-input rf-input--password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                disabled={isLoading}
              />
              <button type="button" className="rf-eye" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} aria-label={showConfirm ? labels.hidePassword : labels.showPassword}>
                {showConfirm ? EyeClosed : EyeOpen}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`rf-btn rf-btn--primary ${isLoading ? 'rf-btn--loading' : ''}`}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <><span className="rf-spinner" />{labels.registering}</>
            ) : labels.registerButton}
          </button>
        </form>

        {/* Divider */}
        <div className="rf-divider"><span>{labels.orContinueWith}</span></div>

        {/* Google */}
        <button
          type="button"
          className={`rf-btn rf-btn--google ${isGoogleLoading ? 'rf-btn--loading' : ''}`}
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <span className="rf-spinner rf-spinner--dark" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          {!isGoogleLoading && labels.googleLogin}
        </button>

        {/* Login link */}
        <p className="rf-link-row">
          {labels.hasAccount}{' '}
          <a href={loginPath} className="rf-link">{labels.login}</a>
        </p>
      </div>

      <style>{`
        .rf-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 100px 20px 40px;
          position: relative;
          overflow: hidden;
        }

        .rf-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .rf-glow-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.12) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          animation: rfFloat 8s ease-in-out infinite;
        }

        .rf-glow-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.07) 0%, transparent 70%);
          bottom: -80px;
          right: -80px;
          animation: rfFloat 10s ease-in-out infinite reverse;
        }

        @keyframes rfFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .rf-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px 40px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.04) inset,
            0 40px 80px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(248, 176, 59, 0.04);
          animation: rfFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes rfFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rf-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
          text-decoration: none;
        }

        .rf-logo img { height: 30px; width: auto; object-fit: contain; }

        .rf-header { text-align: center; margin-bottom: 28px; }

        .rf-title {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .rf-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin: 0;
          line-height: 1.5;
        }

        .rf-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          color: #f87171;
          margin-bottom: 20px;
          animation: rfShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes rfShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .rf-error svg { flex-shrink: 0; }

        .rf-form { display: flex; flex-direction: column; gap: 16px; }

        .rf-field { display: flex; flex-direction: column; gap: 7px; }

        .rf-label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.01em;
        }

        .rf-input-wrap { position: relative; }

        .rf-phone-row {
          display: flex;
          gap: 8px;
        }

        .rf-phone-code {
          width: 115px;
          flex-shrink: 0;
          padding: 12px 8px 12px 12px;
          cursor: pointer;
        }

        .rf-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          transition: color 0.2s;
        }

        .rf-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .rf-input--password { padding-right: 46px; }

        .rf-input:focus {
          border-color: rgba(248, 176, 59, 0.5);
          background: rgba(248, 176, 59, 0.04);
          box-shadow: 0 0 0 3px rgba(248, 176, 59, 0.08);
        }

        .rf-input-wrap:focus-within .rf-input-icon {
          color: rgba(248, 176, 59, 0.7);
        }

        .rf-input::placeholder { color: rgba(255, 255, 255, 0.2); }
        .rf-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .rf-field--error .rf-input {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.04);
        }

        .rf-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: color 0.2s;
        }

        .rf-eye:hover { color: rgba(255, 255, 255, 0.7); }

        .rf-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 4px;
        }

        .rf-btn--primary {
          background: linear-gradient(135deg, #f8b03b 0%, #e9a235 100%);
          color: #000;
          box-shadow: 0 4px 20px rgba(248, 176, 59, 0.25);
        }

        .rf-btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(248, 176, 59, 0.4);
        }

        .rf-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .rf-btn--google {
          background: #fff;
          color: #1f1f1f;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .rf-btn--google:hover:not(:disabled) {
          background: #f5f5f5;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .rf-btn--google:disabled { opacity: 0.6; cursor: not-allowed; }

        .rf-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: rfSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .rf-spinner--dark {
          border: 2px solid rgba(0, 0, 0, 0.15);
          border-top-color: #1f1f1f;
        }

        @keyframes rfSpin { to { transform: rotate(360deg); } }

        .rf-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 16px;
        }

        .rf-divider::before, .rf-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .rf-divider span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          white-space: nowrap;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .rf-link-row {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        .rf-link {
          color: #f8b03b;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
          transition: opacity 0.2s;
        }

        .rf-link:hover { opacity: 0.8; text-decoration: underline; }

        @media (max-width: 480px) {
          .rf-card { padding: 32px 24px; border-radius: 20px; }
          .rf-title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
