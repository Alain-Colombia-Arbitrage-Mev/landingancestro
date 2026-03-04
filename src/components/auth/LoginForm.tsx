import { useState, useEffect, useRef } from 'react';

interface LoginLabels {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  forgotPassword: string;
  loginButton: string;
  loggingIn: string;
  orContinueWith: string;
  googleLogin: string;
  noAccount: string;
  register: string;
  showPassword: string;
  hidePassword: string;
}

interface LoginFormProps {
  labels: LoginLabels;
  forgotPasswordPath: string;
  registerPath: string;
  dashboardPath: string;
  lang: string;
}

export default function LoginForm({
  labels,
  forgotPasswordPath,
  registerPath,
  dashboardPath,
  lang,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();

    // Init auth & redirect if already logged in
    async function initAndCheck() {
      try {
        const { initAuth } = await import('../../lib/auth-init');
        await initAuth();
        const { currentUser } = await import('../../stores/user');
        if (currentUser.get()) {
          window.location.href = dashboardPath;
        }
      } catch {
        // Silent fail — auth not configured yet
      }
    }
    initAndCheck();
  }, [dashboardPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: false, password: false });

    const hasEmailError = !email || !/\S+@\S+\.\S+/.test(email);
    const hasPasswordError = !password || password.length < 6;

    if (hasEmailError || hasPasswordError) {
      setFieldErrors({ email: hasEmailError, password: hasPasswordError });
      return;
    }

    setIsLoading(true);
    try {
      const { login } = await import('../../stores/user');
      const result = await login(email, password);

      if (result.needsVerification) {
        window.location.href = `${dashboardPath.replace('/dashboard', '')}/verify?email=${encodeURIComponent(email)}`;
        return;
      }
      if (result.needsNewPassword) {
        setNeedsNewPassword(true);
        return;
      }
      if (result.success) {
        window.location.href = dashboardPath;
      }
    } catch (err: any) {
      if (err?.name === 'UserNotConfirmedException' || err?.message?.includes('not confirmed')) {
        window.location.href = `${dashboardPath.replace('/dashboard', '')}/verify?email=${encodeURIComponent(email)}`;
        return;
      }
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

  async function handleNewPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError(lang === 'es' ? 'La contraseña debe tener al menos 8 caracteres' : 'Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPwd) {
      setError(lang === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const { cognitoConfirmNewPassword, getCognitoToken, getCognitoUser } = await import('../../lib/auth');
      const { setUser, setAuthToken } = await import('../../stores/user');
      await cognitoConfirmNewPassword(newPassword, email);
      const cognitoToken = await getCognitoToken();
      const cognitoUser = await getCognitoUser();
      setUser({
        id: cognitoUser?.userId || 'cognito',
        email,
        name: cognitoUser?.name || email.split('@')[0],
        phone: cognitoUser?.phone,
        isVerified: true,
        createdAt: new Date().toISOString(),
      });
      setAuthToken(cognitoToken || 'cognito-session');
      window.location.href = dashboardPath;
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setError(getAuthErrorMessage(err, lang));
    } finally {
      setIsLoading(false);
    }
  }

  if (needsNewPassword) {
    return (
      <div className="lf-wrapper">
        <div className="lf-glow lf-glow-1" />
        <div className="lf-glow lf-glow-2" />
        <div className="lf-card">
          <div className="lf-header">
            <div className="lf-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#f8b03b' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="lf-title">{lang === 'es' ? 'Crear nueva contraseña' : 'Create new password'}</h1>
            <p className="lf-subtitle">{lang === 'es' ? 'Tu cuenta requiere que establezcas una nueva contraseña' : 'Your account requires you to set a new password'}</p>
          </div>
          <form onSubmit={handleNewPasswordSubmit} className="lf-form" noValidate>
            <div className="lf-field">
              <label className="lf-label">{lang === 'es' ? 'Nueva contraseña' : 'New password'}</label>
              <div className="lf-input-wrap">
                <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input type={showPassword ? 'text' : 'password'} className="lf-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required disabled={isLoading} />
                <button type="button" className="lf-toggle-pw" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="lf-field">
              <label className="lf-label">{lang === 'es' ? 'Confirmar contraseña' : 'Confirm password'}</label>
              <div className="lf-input-wrap">
                <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input type={showPassword ? 'text' : 'password'} className="lf-input" value={confirmNewPwd} onChange={e => setConfirmNewPwd(e.target.value)} placeholder="••••••••" required disabled={isLoading} />
              </div>
            </div>
            {error && <div className="lf-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>{error}</div>}
            <button type="submit" className="lf-submit" disabled={isLoading}>
              {isLoading ? <span className="lf-spinner" /> : (lang === 'es' ? 'Establecer contraseña' : 'Set password')}
            </button>
          </form>
        </div>
        <style>{cssStyles}</style>
      </div>
    );
  }

  return (
    <div className="lf-wrapper">
      {/* Ambient glow */}
      <div className="lf-glow lf-glow-1" />
      <div className="lf-glow lf-glow-2" />

      <div className="lf-card">
        {/* Logo */}
        <a href="/" className="lf-logo">
          <img src="/logo.svg" alt="Ancestro" width={140} height={28} />
        </a>

        <div className="lf-header">
          <h1 className="lf-title">{labels.title}</h1>
          <p className="lf-subtitle">{labels.subtitle}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="lf-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="lf-form" noValidate>
          {/* Email */}
          <div className={`lf-field ${fieldErrors.email ? 'lf-field--error' : ''}`}>
            <label className="lf-label" htmlFor="lf-email">
              {labels.email}
            </label>
            <div className="lf-input-wrap">
              <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                ref={emailRef}
                id="lf-email"
                type="email"
                className="lf-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: false })); }}
                autoComplete="email"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <span className="lf-field-error">Ingresa un email válido</span>
            )}
          </div>

          {/* Password */}
          <div className={`lf-field ${fieldErrors.password ? 'lf-field--error' : ''}`}>
            <label className="lf-label" htmlFor="lf-password">
              {labels.password}
            </label>
            <div className="lf-input-wrap">
              <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="lf-password"
                type={showPassword ? 'text' : 'password'}
                className="lf-input lf-input--password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: false })); }}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                className="lf-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? labels.hidePassword : labels.showPassword}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="lf-field-error">Ingresa tu contraseña</span>
            )}
          </div>

          {/* Forgot password */}
          <div className="lf-forgot">
            <a href={forgotPasswordPath} className="lf-forgot-link">
              {labels.forgotPassword}
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`lf-btn lf-btn--primary ${isLoading ? 'lf-btn--loading' : ''}`}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <span className="lf-spinner" />
                {labels.loggingIn}
              </>
            ) : labels.loginButton}
          </button>
        </form>

        {/* Divider */}
        <div className="lf-divider">
          <span>{labels.orContinueWith}</span>
        </div>

        {/* Google */}
        <button
          type="button"
          className={`lf-btn lf-btn--google ${isGoogleLoading ? 'lf-btn--loading' : ''}`}
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <span className="lf-spinner lf-spinner--dark" />
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

        {/* Register link */}
        <p className="lf-register-row">
          {labels.noAccount}{' '}
          <a href={registerPath} className="lf-register-link">
            {labels.register}
          </a>
        </p>
      </div>

      <style>{`
        .lf-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 100px 20px 40px;
          position: relative;
          overflow: hidden;
        }

        .lf-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .lf-glow-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.12) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          animation: lfFloat 8s ease-in-out infinite;
        }

        .lf-glow-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.07) 0%, transparent 70%);
          bottom: -80px;
          left: -80px;
          animation: lfFloat 10s ease-in-out infinite reverse;
        }

        @keyframes lfFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .lf-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 44px 40px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.04) inset,
            0 40px 80px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(248, 176, 59, 0.04);
          animation: lfFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes lfFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .lf-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
          text-decoration: none;
        }

        .lf-logo img {
          height: 30px;
          width: auto;
          object-fit: contain;
        }

        .lf-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .lf-title {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .lf-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin: 0;
          line-height: 1.5;
        }

        .lf-error {
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
          animation: lfShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes lfShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .lf-error svg { flex-shrink: 0; }

        .lf-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .lf-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .lf-label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.01em;
        }

        .lf-input-wrap {
          position: relative;
        }

        .lf-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          transition: color 0.2s;
        }

        .lf-input {
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

        .lf-input--password {
          padding-right: 46px;
        }

        .lf-input:focus {
          border-color: rgba(248, 176, 59, 0.5);
          background: rgba(248, 176, 59, 0.04);
          box-shadow: 0 0 0 3px rgba(248, 176, 59, 0.08);
        }

        .lf-input:focus + .lf-input-icon,
        .lf-input-wrap:focus-within .lf-input-icon {
          color: rgba(248, 176, 59, 0.7);
        }

        .lf-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }

        .lf-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .lf-field--error .lf-input {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.04);
        }

        .lf-field-error {
          font-size: 12px;
          color: #f87171;
          padding-left: 2px;
        }

        .lf-eye {
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

        .lf-eye:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .lf-forgot {
          text-align: right;
          margin-top: -6px;
        }

        .lf-forgot-link {
          font-size: 13px;
          color: rgba(248, 176, 59, 0.8);
          text-decoration: none;
          transition: color 0.2s;
        }

        .lf-forgot-link:hover {
          color: #f8b03b;
        }

        .lf-btn {
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

        .lf-btn--primary {
          background: linear-gradient(135deg, #f8b03b 0%, #e9a235 100%);
          color: #000;
          box-shadow: 0 4px 20px rgba(248, 176, 59, 0.25);
        }

        .lf-btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(248, 176, 59, 0.4);
        }

        .lf-btn--primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .lf-btn--primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lf-btn--google {
          background: #fff;
          color: #1f1f1f;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .lf-btn--google:hover:not(:disabled) {
          background: #f5f5f5;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .lf-btn--google:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lf-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: lfSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .lf-spinner--dark {
          border: 2px solid rgba(0, 0, 0, 0.15);
          border-top-color: #1f1f1f;
        }

        @keyframes lfSpin {
          to { transform: rotate(360deg); }
        }

        .lf-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 16px;
        }

        .lf-divider::before,
        .lf-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .lf-divider span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          white-space: nowrap;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .lf-register-row {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        .lf-register-link {
          color: #f8b03b;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
          transition: opacity 0.2s;
        }

        .lf-register-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .lf-card {
            padding: 36px 24px;
            border-radius: 20px;
          }

          .lf-title {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}
