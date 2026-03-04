import { useState, useEffect, useCallback, useRef } from 'react';

interface PdfViewerLabels {
  close: string;
  loading: string;
  download: string;
  openNewTab: string;
  errorLoading: string;
}

interface PdfViewerProps {
  labels: PdfViewerLabels;
  termsLabel: string;
  privacyLabel: string;
}

export default function PdfViewer({ labels, termsLabel, privacyLabel }: PdfViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const pdfUrl = '/Ancestro_Policy.pdf';

  const open = useCallback((title: string) => {
    setDocTitle(title);
    setIsLoading(true);
    setHasError(false);
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
      const link = target.closest('[data-pdf-viewer]');
      if (!link) return;

      e.preventDefault();
      const type = link.getAttribute('data-pdf-viewer');
      if (type === 'terms') open(termsLabel);
      else if (type === 'privacy') open(privacyLabel);
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open, termsLabel, privacyLabel]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) close();
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={styles.overlay}
    >
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#d4a017', flexShrink: 0 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span style={styles.headerTitle}>{docTitle}</span>
          </div>
          <div style={styles.headerActions}>
            <a
              href={pdfUrl}
              download
              style={styles.actionBtn}
              title={labels.download}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span style={styles.actionLabel}>{labels.download}</span>
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.actionBtn}
              title={labels.openNewTab}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span style={styles.actionLabel}>{labels.openNewTab}</span>
            </a>
            <button onClick={close} style={styles.closeBtn} aria-label={labels.close}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div style={styles.content}>
          {isLoading && !hasError && (
            <div style={styles.loaderWrap}>
              <div style={styles.spinner} />
              <span style={styles.loaderText}>{labels.loading}</span>
            </div>
          )}
          {hasError && (
            <div style={styles.errorWrap}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#f87171' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p style={styles.errorText}>{labels.errorLoading}</p>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={styles.errorLink}>
                {labels.openNewTab}
              </a>
            </div>
          )}
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            style={{
              ...styles.iframe,
              opacity: isLoading ? 0 : 1,
            }}
            title={docTitle}
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pdfViewerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pdfViewerSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pdfViewerSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    padding: '16px',
    animation: 'pdfViewerFadeIn 0.3s ease both',
  },
  modal: {
    width: '100%',
    maxWidth: '1000px',
    height: '92vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(165deg, rgba(24,22,18,0.98) 0%, rgba(12,11,9,0.99) 100%)',
    border: '1px solid rgba(212,160,23,0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 0 80px rgba(212,160,23,0.05), 0 32px 64px rgba(0,0,0,0.6)',
    animation: 'pdfViewerSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    flex: 1,
  },
  headerTitle: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '15px',
    fontWeight: 600,
    color: '#f5f0e6',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 500,
    color: 'rgba(245,240,230,0.6)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionLabel: {
    display: 'inline',
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    color: 'rgba(245,240,230,0.6)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginLeft: '4px',
  },
  content: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    transition: 'opacity 0.3s ease',
  },
  loaderWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    zIndex: 1,
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(212,160,23,0.15)',
    borderTopColor: '#d4a017',
    borderRadius: '50%',
    animation: 'pdfViewerSpin 0.8s linear infinite',
  },
  loaderText: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '14px',
    color: 'rgba(245,240,230,0.4)',
  },
  errorWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    zIndex: 1,
  },
  errorText: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '15px',
    color: 'rgba(245,240,230,0.5)',
    textAlign: 'center',
    margin: 0,
  },
  errorLink: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#d4a017',
    textDecoration: 'none',
    padding: '10px 20px',
    border: '1px solid rgba(212,160,23,0.3)',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
};
