import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useState } from 'react';
import Web3Provider from './Web3Provider';

interface ConnectWalletLabels {
  connect: string;
  disconnect: string;
  connected: string;
  connecting: string;
  noWallet: string;
  balance: string;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletButton({ labels }: { labels: ConnectWalletLabels }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const [showMenu, setShowMenu] = useState(false);

  if (isConnecting) {
    return (
      <button style={styles.btn} disabled>
        <span style={styles.spinner} />
        <span>{labels.connecting}</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div style={styles.connectedWrap}>
        <button style={styles.connectedBtn} onClick={() => setShowMenu(!showMenu)}>
          <span style={styles.statusDot} />
          <span style={styles.addressText}>{truncateAddress(address)}</span>
          {balanceData && (
            <span style={styles.balanceText}>
              {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showMenu && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownInfo}>
              <span style={styles.dropdownLabel}>{labels.connected}</span>
              <span style={styles.dropdownAddress}>{address}</span>
            </div>
            <div style={styles.dropdownDivider} />
            <button style={styles.disconnectBtn} onClick={() => { disconnect(); setShowMenu(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {labels.disconnect}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      style={styles.btn}
      onClick={() => {
        try {
          connect({ connector: injected() });
        } catch {
          alert(labels.noWallet);
        }
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
      <span>{labels.connect}</span>
    </button>
  );
}

interface ConnectWalletProps {
  labels: ConnectWalletLabels;
}

export default function ConnectWallet({ labels }: ConnectWalletProps) {
  return (
    <Web3Provider>
      <WalletButton labels={labels} />
    </Web3Provider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 600,
    color: '#0a0a08',
    background: 'linear-gradient(135deg, #d4a017 0%, #b8860b 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 2px 12px rgba(212,160,23,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
    whiteSpace: 'nowrap' as const,
  },
  connectedWrap: {
    position: 'relative' as const,
  },
  connectedBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 500,
    color: '#f5f0e6',
    background: 'rgba(212,160,23,0.08)',
    border: '1px solid rgba(212,160,23,0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    backdropFilter: 'blur(12px)',
  },
  statusDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 6px rgba(74,222,128,0.5)',
  },
  addressText: {
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    fontSize: '13px',
    color: '#d4a017',
  },
  balanceText: {
    fontSize: '12px',
    color: 'rgba(245,240,230,0.5)',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    paddingLeft: '8px',
    marginLeft: '4px',
  },
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '280px',
    background: 'rgba(20,18,14,0.97)',
    border: '1px solid rgba(212,160,23,0.15)',
    borderRadius: '14px',
    padding: '12px',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  dropdownInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    padding: '8px',
  },
  dropdownLabel: {
    fontSize: '11px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 600,
    color: 'rgba(245,240,230,0.4)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  dropdownAddress: {
    fontSize: '11px',
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    color: '#d4a017',
    wordBreak: 'break-all' as const,
    lineHeight: 1.4,
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '8px 0',
  },
  disconnectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 8px',
    fontSize: '13px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontWeight: 500,
    color: '#f87171',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(10,10,8,0.2)',
    borderTopColor: '#0a0a08',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};
