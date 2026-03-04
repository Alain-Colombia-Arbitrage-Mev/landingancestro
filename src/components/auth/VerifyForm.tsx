import { useState, useEffect, useRef, useCallback } from 'react';

interface VerifyLabels {
  title: string;
  subtitle: string;
  verifyButton: string;
  verifying: string;
  resendCode: string;
  codeSent: string;
  verified: string;
}

interface VerifyFormProps {
  labels: VerifyLabels;
  registerPath: string;
  loginPath: string;
  lang: string;
}

export default function VerifyForm({
  labels,
  registerPath,
  loginPath,
  lang,
}: VerifyFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email') || '';
    if (!emailParam) {
      window.location.href = registerPath;
      return;
    }
    setEmail(emailParam);
    inputRefs.current[0]?.focus();

    async function init() {
      try {
        const { initAuth } = await import('../../lib/auth-init');
        await initAuth();
      } catch {}
    }
    init();
  }, [registerPath]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const submitCode = useCallback(async (fullCode: string) => {
    if (fullCode.length !== 6 || isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const { cognitoConfirmSignUp } = await import('../../lib/auth');
      await cognitoConfirmSignUp(email, fullCode);
      setSuccess(labels.verified);
      setTimeout(() => { window.location.href = loginPath; }, 1500);
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setError(getAuthErrorMessage(err, lang));
      setIsLoading(false);
      setCode(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [email, isLoading, lang, labels.verified, loginPath]);

  function handleInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      e.preventDefault();
      const newCode = paste.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      submitCode(paste);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');

    try {
      const { cognitoResendCode } = await import('../../lib/auth');
      await cognitoResendCode(email);
      setResendCooldown(30);
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setError(getAuthErrorMessage(err, lang));
    } finally {
      setIsResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitCode(code.join(''));
  }

  return (
    <div className="vf-wrapper">
      <div className="vf-glow vf-glow-1" />
      <div className="vf-glow vf-glow-2" />

      <div className="vf-card">
        <a href="/" className="vf-logo">
          <img src="/logo.svg" alt="Ancestro" width={140} height={28} />
        </a>

        <div className="vf-header">
          <h1 className="vf-title">{labels.title}</h1>
          <p className="vf-subtitle">
            {labels.subtitle} <strong className="vf-email">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="vf-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="vf-success" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="vf-form">
          <div className="vf-code-inputs">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`vf-code-input ${digit ? 'vf-code-input--filled' : ''}`}
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={isLoading || !!success}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            className={`vf-btn vf-btn--primary ${isLoading ? 'vf-btn--loading' : ''}`}
            disabled={isLoading || code.join('').length !== 6 || !!success}
          >
            {isLoading ? (
              <><span className="vf-spinner" />{labels.verifying}</>
            ) : labels.verifyButton}
          </button>
        </form>

        <div className="vf-resend">
          <button
            type="button"
            className="vf-resend-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending || !!success}
          >
            {resendCooldown > 0
              ? `${labels.codeSent} (${resendCooldown}s)`
              : isResending
                ? '...'
                : labels.resendCode}
          </button>
        </div>
      </div>

      <style>{`
        .vf-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 100px 20px 40px;
          position: relative;
          overflow: hidden;
        }

        .vf-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .vf-glow-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.12) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          animation: vfFloat 8s ease-in-out infinite;
        }

        .vf-glow-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(248, 176, 59, 0.07) 0%, transparent 70%);
          bottom: -80px;
          left: -80px;
          animation: vfFloat 10s ease-in-out infinite reverse;
        }

        @keyframes vfFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .vf-card {
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
          animation: vfFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes vfFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vf-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
          text-decoration: none;
        }

        .vf-logo img { height: 30px; width: auto; object-fit: contain; }

        .vf-header { text-align: center; margin-bottom: 32px; }

        .vf-title {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px;
          letter-spacing: -0.5px;
        }

        .vf-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.45);
          margin: 0;
          line-height: 1.6;
        }

        .vf-email {
          color: #f8b03b;
          font-weight: 600;
          word-break: break-all;
        }

        .vf-error {
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
          animation: vfShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        .vf-success {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          color: #4ade80;
          margin-bottom: 20px;
        }

        .vf-error svg, .vf-success svg { flex-shrink: 0; }

        @keyframes vfShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .vf-form { display: flex; flex-direction: column; gap: 24px; }

        .vf-code-inputs {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .vf-code-input {
          width: 52px;
          height: 60px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
          caret-color: #f8b03b;
        }

        .vf-code-input:focus {
          border-color: rgba(248, 176, 59, 0.5);
          background: rgba(248, 176, 59, 0.04);
          box-shadow: 0 0 0 3px rgba(248, 176, 59, 0.08);
        }

        .vf-code-input--filled {
          border-color: rgba(248, 176, 59, 0.3);
          background: rgba(248, 176, 59, 0.06);
        }

        .vf-code-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .vf-btn {
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
        }

        .vf-btn--primary {
          background: linear-gradient(135deg, #f8b03b 0%, #e9a235 100%);
          color: #000;
          box-shadow: 0 4px 20px rgba(248, 176, 59, 0.25);
        }

        .vf-btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(248, 176, 59, 0.4);
        }

        .vf-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .vf-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: vfSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes vfSpin { to { transform: rotate(360deg); } }

        .vf-resend {
          text-align: center;
          margin-top: 20px;
        }

        .vf-resend-btn {
          background: none;
          border: none;
          color: rgba(248, 176, 59, 0.8);
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: color 0.2s;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .vf-resend-btn:hover:not(:disabled) { color: #f8b03b; }
        .vf-resend-btn:disabled { color: rgba(255, 255, 255, 0.3); cursor: not-allowed; }

        @media (max-width: 480px) {
          .vf-card { padding: 36px 24px; border-radius: 20px; }
          .vf-title { font-size: 22px; }
          .vf-code-input { width: 44px; height: 52px; font-size: 20px; border-radius: 12px; }
          .vf-code-inputs { gap: 8px; }
        }
      `}</style>
    </div>
  );
}
