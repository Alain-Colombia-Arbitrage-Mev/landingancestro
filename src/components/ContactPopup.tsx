import { useState, useEffect, useCallback, useRef } from 'react';

interface ContactPopupLabels {
  title: string;
  subtitle: string;
  name: string;
  email: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  success: string;
  fullForm: string;
  close: string;
  typeOrder: string;
  typeBudget: string;
  typeInfo: string;
  typeCharger: string;
  typeGeneral: string;
}

interface ContactPopupProps {
  labels: ContactPopupLabels;
  contactPath: string;
}

const TYPE_LABELS: Record<string, keyof ContactPopupLabels> = {
  order: 'typeOrder',
  budget: 'typeBudget',
  info: 'typeInfo',
  charger: 'typeCharger',
  general: 'typeGeneral',
};

export default function ContactPopup({ labels, contactPath }: ContactPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contactType, setContactType] = useState('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);

  const open = useCallback((type: string) => {
    setContactType(type || 'general');
    setStatus('idle');
    setName('');
    setEmail('');
    setMessage('');
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) close();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const trigger = target.closest('[data-contact-popup]');
      if (!trigger) return;
      e.preventDefault();
      const type = trigger.getAttribute('data-contact-popup') || 'general';
      open(type);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) close();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStatus('loading');

    const typeKey = TYPE_LABELS[contactType] || 'typeGeneral';
    const typeLabel = labels[typeKey];

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('contactType', typeLabel);
      formData.append('message', message);
      formData.append('_subject', `Ancestro — ${typeLabel}`);
      formData.append('_captcha', 'false');

      await fetch('https://formsubmit.co/ajax/info@ancestro.co', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
    } catch (_) {}

    setStatus('success');
  }

  if (!isOpen) return null;

  const typeKey = TYPE_LABELS[contactType] || 'typeGeneral';
  const currentTypeLabel = labels[typeKey];

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} style={s.overlay}>
      <div style={s.modal}>
        <button onClick={close} style={s.closeBtn} aria-label={labels.close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {status === 'success' ? (
          <div style={s.successWrap}>
            <div style={s.successIcon}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={s.successTitle}>{labels.success}</h3>
            <button onClick={close} style={s.successBtn}>{labels.close}</button>
          </div>
        ) : (
          <>
            <div style={s.header}>
              <div style={s.headerIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h2 style={s.title}>{labels.title}</h2>
                <p style={s.subtitle}>{labels.subtitle}</p>
              </div>
            </div>

            <div style={s.typeBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <span>{currentTypeLabel}</span>
            </div>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldRow}>
                <div style={s.field}>
                  <label style={s.label} htmlFor="cp-name">{labels.name} *</label>
                  <input
                    id="cp-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    style={s.input}
                    placeholder={labels.name}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label} htmlFor="cp-email">{labels.email} *</label>
                  <input
                    id="cp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={s.input}
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label} htmlFor="cp-message">{labels.message}</label>
                <textarea
                  id="cp-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  style={{ ...s.input, resize: 'vertical' as const, minHeight: '72px' }}
                  placeholder={labels.messagePlaceholder}
                />
              </div>

              <button type="submit" disabled={status === 'loading'} style={s.submitBtn}>
                {status === 'loading' ? (
                  <span style={s.spinner} />
                ) : (
                  <>
                    <span>{labels.submit}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <a href={`${contactPath}?type=${contactType}`} style={s.fullFormLink} onClick={close}>
              {labels.fullForm}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </>
        )}
      </div>

      <style>{`
        @keyframes cpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cpSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cpSpin { to { transform: rotate(360deg); } }
        @keyframes cpPop { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 49000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '16px',
    animation: 'cpFadeIn 0.25s ease both',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    background: 'linear-gradient(165deg, rgba(28,26,22,0.97) 0%, rgba(14,13,11,0.99) 100%)',
    border: '1px solid rgba(248,176,59,0.12)',
    borderRadius: '20px',
    padding: '32px 28px 24px',
    boxShadow: '0 0 60px rgba(248,176,59,0.06), 0 24px 48px rgba(0,0,0,0.5)',
    animation: 'cpSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
  },
  headerIcon: {
    width: '44px',
    height: '44px',
    minWidth: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(248,176,59,0.15), rgba(248,176,59,0.05))',
    border: '1px solid rgba(248,176,59,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f8b03b',
  },
  title: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: '#f5f0e6',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    margin: '4px 0 0',
    lineHeight: 1.4,
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 14px',
    background: 'rgba(248,176,59,0.08)',
    border: '1px solid rgba(248,176,59,0.18)',
    borderRadius: '100px',
    color: '#f8b03b',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    marginBottom: '20px',
    letterSpacing: '0.02em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#f5f0e6',
    fontSize: '15px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box' as const,
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #f8b03b 0%, #e9a235 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#0e0d09',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
    marginTop: '4px',
  },
  spinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid rgba(14,13,9,0.2)',
    borderTopColor: '#0e0d09',
    borderRadius: '50%',
    animation: 'cpSpin 0.7s linear infinite',
  },
  fullFormLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '16px',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    color: 'rgba(255,255,255,0.35)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    paddingBottom: '2px',
  },
  successWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px 0',
    gap: '16px',
  },
  successIcon: {
    color: '#4ade80',
    animation: 'cpPop 0.5s ease both',
  },
  successTitle: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    color: '#f5f0e6',
    margin: 0,
  },
  successBtn: {
    padding: '12px 32px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#f5f0e6',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px',
  },
};
