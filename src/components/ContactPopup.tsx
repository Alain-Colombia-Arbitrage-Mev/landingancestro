import { useState, useEffect, useCallback, useRef } from 'react';

interface ContactPopupLabels {
  title: string;
  subtitle: string;
  name: string;
  email: string;
  phone: string;
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
  product: string;
  productSolar: string;
  productBattery: string;
  productCharger: string;
  productVehicle: string;
  productOther: string;
  contactType: string;
}

interface ContactPopupProps {
  labels: ContactPopupLabels;
  contactPath: string;
}

const TYPE_OPTIONS = ['order', 'budget', 'info', 'charger', 'general'] as const;
const TYPE_LABEL_MAP: Record<string, keyof ContactPopupLabels> = {
  order: 'typeOrder',
  budget: 'typeBudget',
  info: 'typeInfo',
  charger: 'typeCharger',
  general: 'typeGeneral',
};

const PRODUCT_OPTIONS = ['solar', 'battery', 'charger', 'vehicle', 'other'] as const;
const PRODUCT_LABEL_MAP: Record<string, keyof ContactPopupLabels> = {
  solar: 'productSolar',
  battery: 'productBattery',
  charger: 'productCharger',
  vehicle: 'productVehicle',
  other: 'productOther',
};

/** Genera emoji de bandera a partir del código ISO 3166-1 alpha-2 (ej: CO → 🇨🇴) */
function getFlagEmoji(code: string): string {
  const c = code.toUpperCase();
  if (c.length !== 2) return '';
  return String.fromCodePoint(
    ...[...c].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0))
  );
}

const COUNTRIES = [
  { code: 'CO', name: 'Colombia', dial: '+57' },
  { code: 'MX', name: 'México', dial: '+52' },
  { code: 'BR', name: 'Brasil', dial: '+55' },
  { code: 'AR', name: 'Argentina', dial: '+54' },
  { code: 'CL', name: 'Chile', dial: '+56' },
  { code: 'PE', name: 'Perú', dial: '+51' },
  { code: 'PA', name: 'Panamá', dial: '+507' },
  { code: 'CR', name: 'Costa Rica', dial: '+506' },
  { code: 'EC', name: 'Ecuador', dial: '+593' },
  { code: 'UY', name: 'Uruguay', dial: '+598' },
  { code: 'GT', name: 'Guatemala', dial: '+502' },
  { code: 'SV', name: 'El Salvador', dial: '+503' },
  { code: 'HN', name: 'Honduras', dial: '+504' },
  { code: 'NI', name: 'Nicaragua', dial: '+505' },
  { code: 'DO', name: 'Rep. Dominicana', dial: '+1' },
  { code: 'BO', name: 'Bolivia', dial: '+591' },
  { code: 'PY', name: 'Paraguay', dial: '+595' },
  { code: 'VE', name: 'Venezuela', dial: '+58' },
  { code: 'US', name: 'Estados Unidos (USD)', dial: '+1' },
  { code: 'ES', name: 'España', dial: '+34' },
];

const SHOW_PRODUCT_FOR = ['order', 'budget', 'info'];

export default function ContactPopup({ labels, contactPath }: ContactPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contactType, setContactType] = useState('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);

  const open = useCallback((type: string) => {
    setContactType(type || 'general');
    setStatus('idle');
    setName('');
    setEmail('');
    setPhone('');
    setProduct('');
    setMessage('');
    setCountryCode('+57');
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

    const fullPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: fullPhone,
          contactType,
          message,
        }),
      });

      if (!res.ok) throw new Error('Server error');
      setStatus('success');
    } catch (_) {
      setStatus('idle');
      alert('Error al enviar el formulario. Intenta de nuevo.');
    }
  }

  if (!isOpen) return null;

  const showProduct = SHOW_PRODUCT_FOR.includes(contactType);

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

            <form onSubmit={handleSubmit} style={s.form}>
              {/* Contact type selector */}
              <div style={s.field}>
                <label style={s.label} htmlFor="cp-type">{labels.contactType}</label>
                <div style={s.selectWrap}>
                  <select
                    id="cp-type"
                    value={contactType}
                    onChange={(e) => { setContactType(e.target.value); setProduct(''); }}
                    style={s.select}
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{labels[TYPE_LABEL_MAP[opt]]}</option>
                    ))}
                  </select>
                  <span style={s.selectArrow}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                </div>
              </div>

              {/* Product (conditional) */}
              {showProduct && (
                <div style={s.field}>
                  <label style={s.label} htmlFor="cp-product">{labels.product}</label>
                  <div style={s.selectWrap}>
                    <select
                      id="cp-product"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      style={s.select}
                    >
                      <option value="">{labels.product}</option>
                      {PRODUCT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{labels[PRODUCT_LABEL_MAP[opt]]}</option>
                      ))}
                    </select>
                    <span style={s.selectArrow}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                  </div>
                </div>
              )}

              {/* Name + Email row */}
              <div style={s.fieldRow} className="cp-field-row">
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

              {/* Phone with country code */}
              <div style={s.field}>
                <label style={s.label} htmlFor="cp-phone">{labels.phone}</label>
                <div style={s.phoneRow} className="cp-phone-row">
                  <div style={s.phoneCodeWrap} className="cp-phone-code-wrap">
                    <span className="cp-phone-flag" aria-hidden="true">
                      {getFlagEmoji(COUNTRIES.find((c) => c.dial === countryCode)?.code ?? 'CO')}
                    </span>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={s.phoneCodeSelect}
                      className="cp-phone-code-select"
                      title={labels.phone}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={`${c.code}-${c.dial}`} value={c.dial}>
                          {getFlagEmoji(c.code)} {c.dial} {c.name}
                        </option>
                      ))}
                    </select>
                    <span style={s.selectArrow} className="cp-phone-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                  </div>
                  <input
                    id="cp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel-national"
                    style={{ ...s.input, flex: 1 }}
                    placeholder="300 123 4567"
                  />
                </div>
              </div>

              {/* Message */}
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
        #cp-type, #cp-product, [data-cp-phone-code] select {
          background-color: #1c1a16 !important;
          color: #f5f0e6 !important;
        }
        #cp-type option, #cp-product option, [data-cp-phone-code] select option {
          background-color: #1c1a16 !important;
          color: #f5f0e6 !important;
          padding: 8px 12px;
        }
        #cp-type:focus, #cp-product:focus, [data-cp-phone-code] select:focus {
          border-color: rgba(248,176,59,0.4) !important;
          box-shadow: 0 0 0 2px rgba(248,176,59,0.1) !important;
        }
        .cp-phone-code-select {
          background-color: #1c1a16 !important;
          color: #f5f0e6 !important;
        }
        .cp-phone-code-select option {
          background-color: #1c1a16 !important;
          color: #f5f0e6 !important;
        }
        .cp-phone-code-wrap {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .cp-phone-flag {
          font-size: 1.5rem !important;
          line-height: 1 !important;
          flex-shrink: 0 !important;
          width: 32px !important;
          text-align: center !important;
        }
        .cp-phone-code-select {
          flex: 1 !important;
          min-width: 0 !important;
          padding-left: 10px !important;
        }
        .cp-input:focus {
          border-color: rgba(248,176,59,0.4) !important;
          box-shadow: 0 0 0 2px rgba(248,176,59,0.1) !important;
        }
        @media (max-width: 520px) {
          .cp-field-row { grid-template-columns: 1fr !important; }
          .cp-phone-row { flex-direction: column !important; }
          .cp-phone-code-wrap { width: 100% !important; }
        }
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
    maxWidth: '560px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#f5f0e6',
    fontSize: '14px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box' as const,
  },
  selectWrap: {
    position: 'relative' as const,
  },
  select: {
    width: '100%',
    padding: '11px 36px 11px 14px',
    backgroundColor: '#1c1a16',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#f5f0e6',
    fontSize: '14px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    boxSizing: 'border-box' as const,
  },
  selectArrow: {
    position: 'absolute' as const,
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.35)',
    pointerEvents: 'none' as const,
  },
  phoneRow: {
    display: 'flex',
    gap: '10px',
  },
  phoneCodeWrap: {
    position: 'relative' as const,
    flexShrink: 0,
    minWidth: '200px',
  },
  phoneCodeSelect: {
    width: '100%',
    padding: '11px 28px 11px 12px',
    backgroundColor: '#1c1a16',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#f5f0e6',
    fontSize: '13px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
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
    marginTop: '14px',
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
