import { useState, useEffect } from 'react';

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

interface DashboardLabels {
  welcome: string;
  memberSince: string;
  editProfile: string;
  changePassword: string;
  logout: string;
  name: string;
  phone: string;
  save: string;
  saving: string;
  profileUpdated: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordsNoMatch: string;
  passwordChanged: string;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface DashboardPanelProps {
  labels: DashboardLabels;
  loginPath: string;
  lang: string;
}

export default function DashboardPanel({
  labels,
  loginPath,
  lang,
}: DashboardPanelProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [activePanel, setActivePanel] = useState<'profile' | 'password' | null>(null);

  const [profileName, setProfileName] = useState('');
  const [profilePhoneCode, setProfilePhoneCode] = useState('+1');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const { initAuth } = await import('../../lib/auth-init');
        await initAuth();
        const { currentUser } = await import('../../stores/user');
        const u = currentUser.get();
        if (!u) {
          window.location.href = loginPath;
          return;
        }
        setUser(u);
        setProfileName(u.name);
        if (u.phone) {
          const match = u.phone.match(/^(\+\d{1,4})\s*(.*)$/);
          if (match) {
            setProfilePhoneCode(match[1]);
            setProfilePhone(match[2]);
          } else {
            setProfilePhone(u.phone);
          }
        }
      } catch {
        window.location.href = loginPath;
      }
    }
    init();
  }, [loginPath]);

  function togglePanel(panel: 'profile' | 'password') {
    setActivePanel(activePanel === panel ? null : panel);
    setProfileMsg(null);
    setPwMsg(null);
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const { cognitoUpdateProfile } = await import('../../lib/auth');
      await cognitoUpdateProfile({
        name: profileName,
        ...(profilePhone.trim() ? { phone_number: `${profilePhoneCode}${profilePhone.trim()}` } : {}),
      });

      const { currentUser, setUser: storeSetUser } = await import('../../stores/user');
      const current = currentUser.get();
      if (current) {
        const fullPhone = profilePhone.trim() ? `${profilePhoneCode} ${profilePhone.trim()}` : undefined;
        const updated = { ...current, name: profileName, phone: fullPhone };
        storeSetUser(updated);
        setUser(updated);
      }

      setProfileMsg({ type: 'success', text: labels.profileUpdated });
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setProfileMsg({ type: 'error', text: getAuthErrorMessage(err, lang) });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);

    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: labels.passwordsNoMatch });
      return;
    }

    setPwLoading(true);
    try {
      const { cognitoChangePassword } = await import('../../lib/auth');
      await cognitoChangePassword(currentPw, newPw);
      setPwMsg({ type: 'success', text: labels.passwordChanged });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      const { getAuthErrorMessage } = await import('../../lib/auth');
      setPwMsg({ type: 'error', text: getAuthErrorMessage(err, lang) });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const { logout } = await import('../../stores/user');
      await logout();
    } catch {}
    window.location.href = loginPath;
  }

  if (!user) {
    return (
      <div className="dp-loading">
        <div className="dp-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="dp-wrapper">
      <div className="dp-glow dp-glow-1" />

      <div className="dp-content">
        {/* Profile Card */}
        <div className="dp-profile-card">
          <div className="dp-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="dp-welcome">{labels.welcome}, <span className="dp-name">{user.name}</span></h1>
          <p className="dp-email">{user.email}</p>
          <p className="dp-meta">{labels.memberSince}: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Actions */}
        <div className="dp-actions">
          {/* Edit Profile */}
          <button
            className={`dp-action-btn ${activePanel === 'profile' ? 'dp-action-btn--active' : ''}`}
            onClick={() => togglePanel('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {labels.editProfile}
            <svg className={`dp-chevron ${activePanel === 'profile' ? 'dp-chevron--open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {activePanel === 'profile' && (
            <div className="dp-panel">
              {profileMsg && (
                <div className={`dp-msg dp-msg--${profileMsg.type}`}>{profileMsg.text}</div>
              )}
              <form onSubmit={handleProfileSubmit} className="dp-form">
                <div className="dp-field">
                  <label className="dp-label">{labels.name}</label>
                  <input className="dp-input" type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required disabled={profileLoading} />
                </div>
                <div className="dp-field">
                  <label className="dp-label">{labels.phone}</label>
                  <div className="dp-phone-row">
                    <select className="dp-input dp-phone-code" value={profilePhoneCode} onChange={(e) => setProfilePhoneCode(e.target.value)} disabled={profileLoading}>
                      {PHONE_CODES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                    </select>
                    <input className="dp-input" style={{ flex: 1 }} type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value.replace(/[^0-9\s\-()]/g, ''))} placeholder="300 000 0000" disabled={profileLoading} />
                  </div>
                </div>
                <button type="submit" className="dp-btn dp-btn--primary" disabled={profileLoading}>
                  {profileLoading ? <><span className="dp-spinner" />{labels.saving}</> : labels.save}
                </button>
              </form>
            </div>
          )}

          {/* Change Password */}
          <button
            className={`dp-action-btn ${activePanel === 'password' ? 'dp-action-btn--active' : ''}`}
            onClick={() => togglePanel('password')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {labels.changePassword}
            <svg className={`dp-chevron ${activePanel === 'password' ? 'dp-chevron--open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {activePanel === 'password' && (
            <div className="dp-panel">
              {pwMsg && (
                <div className={`dp-msg dp-msg--${pwMsg.type}`}>{pwMsg.text}</div>
              )}
              <form onSubmit={handlePasswordSubmit} className="dp-form">
                <div className="dp-field">
                  <label className="dp-label">{labels.currentPassword}</label>
                  <input className="dp-input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required autoComplete="current-password" disabled={pwLoading} />
                </div>
                <div className="dp-field">
                  <label className="dp-label">{labels.newPassword}</label>
                  <input className="dp-input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} autoComplete="new-password" disabled={pwLoading} />
                </div>
                <div className="dp-field">
                  <label className="dp-label">{labels.confirmPassword}</label>
                  <input className="dp-input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required minLength={8} autoComplete="new-password" disabled={pwLoading} />
                </div>
                <button type="submit" className="dp-btn dp-btn--primary" disabled={pwLoading}>
                  {pwLoading ? <><span className="dp-spinner" />{labels.saving}</> : labels.changePassword}
                </button>
              </form>
            </div>
          )}

          {/* Logout */}
          <button className="dp-action-btn dp-action-btn--danger" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {labels.logout}
          </button>
        </div>
      </div>

      <style>{`
        .dp-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#000}
        .dp-loading-spinner{width:32px;height:32px;border:3px solid rgba(248,176,59,.2);border-top-color:rgba(248,176,59,.8);border-radius:50%;animation:dpSpin .8s linear infinite}

        .dp-wrapper{background:#000;min-height:100vh;position:relative;overflow:hidden}
        .dp-glow{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
        .dp-glow-1{width:600px;height:600px;background:radial-gradient(circle,rgba(248,176,59,.08) 0%,transparent 70%);top:-200px;right:-200px}

        .dp-content{position:relative;z-index:1;padding:119px 20px 60px;max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:20px;min-height:calc(100vh - 200px)}

        .dp-profile-card{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:48px 32px;text-align:center}

        .dp-avatar{width:80px;height:80px;border-radius:50%;background:rgba(248,176,59,.15);border:2px solid rgba(248,176,59,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;color:#f8b03b}

        .dp-welcome{font-size:24px;font-weight:700;color:#fff;margin:0 0 8px}
        .dp-name{color:#f8b03b}
        .dp-email{font-size:15px;color:rgba(255,255,255,.5);margin:0 0 4px}
        .dp-meta{font-size:13px;color:rgba(255,255,255,.3);margin:0}

        .dp-actions{width:100%;display:flex;flex-direction:column;gap:4px}

        .dp-action-btn{display:flex;align-items:center;gap:12px;width:100%;padding:16px 20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:14px;color:#fff;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s ease}
        .dp-action-btn:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
        .dp-action-btn--active{border-color:rgba(248,176,59,.3);background:rgba(248,176,59,.05)}
        .dp-action-btn--danger{color:#ef4444;border-color:rgba(239,68,68,.2)}
        .dp-action-btn--danger:hover{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3)}

        .dp-chevron{margin-left:auto;transition:transform .2s;color:rgba(255,255,255,.4)}
        .dp-chevron--open{transform:rotate(180deg);color:#f8b03b}

        .dp-panel{padding:24px 20px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:14px;animation:dpSlideDown .3s ease}
        @keyframes dpSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

        .dp-msg{padding:10px 14px;border-radius:10px;font-size:14px;margin-bottom:12px}
        .dp-msg--success{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22c55e}
        .dp-msg--error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444}

        .dp-form{display:flex;flex-direction:column;gap:16px}
        .dp-field{display:flex;flex-direction:column;gap:6px}
        .dp-label{font-size:13px;font-weight:500;color:rgba(255,255,255,.55)}

        .dp-input{width:100%;padding:13px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:12px;color:#fff;font-size:15px;font-family:inherit;outline:none;transition:all .2s ease;box-sizing:border-box}
        .dp-input:focus{border-color:rgba(248,176,59,.5);background:rgba(248,176,59,.04);box-shadow:0 0 0 3px rgba(248,176,59,.08)}
        .dp-phone-row{display:flex;gap:8px}
        .dp-phone-code{width:115px;flex-shrink:0;padding:13px 8px 13px 12px;cursor:pointer}
        .dp-phone-code option{background:#1a1a16;color:#fff}
        .dp-input::placeholder{color:rgba(255,255,255,.2)}
        .dp-input:disabled{opacity:.5;cursor:not-allowed}

        .dp-btn{width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .25s ease;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:4px}
        .dp-btn--primary{background:linear-gradient(135deg,#f8b03b 0%,#e9a235 100%);color:#000;box-shadow:0 4px 20px rgba(248,176,59,.25)}
        .dp-btn--primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px rgba(248,176,59,.4)}
        .dp-btn--primary:disabled{opacity:.6;cursor:not-allowed}

        .dp-spinner{width:18px;height:18px;border:2px solid rgba(0,0,0,.2);border-top-color:#000;border-radius:50%;animation:dpSpin .7s linear infinite;flex-shrink:0}
        @keyframes dpSpin{to{transform:rotate(360deg)}}

        @media(max-width:480px){.dp-content{padding-top:100px}.dp-profile-card{padding:36px 24px}}
      `}</style>
    </div>
  );
}
