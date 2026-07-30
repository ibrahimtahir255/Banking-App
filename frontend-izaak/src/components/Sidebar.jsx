import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ accounts = [], activeAccountId = null, onNewStash }) {
  const { session, logOut } = useAuth();
  const navigate = useNavigate();

  const initials = (session?.name || session?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: 214,
        flex: 'none',
        borderRight: 'var(--bw) var(--bs) var(--ink)',
        padding: '22px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div
          style={{
            width: 26,
            height: 26,
            border: 'var(--bw) var(--bs) var(--ink)',
            borderRadius: '50%',
            background: 'var(--brand)',
          }}
        />
        <span style={{ fontSize: 19 }}>
          <span style={{ color: 'var(--brand)', fontWeight: 700 }}>Pig</span> E-Bank
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 17 }}>
        <Link to="/" style={navItemStyle(activeAccountId === null)}>Home base</Link>
        <span style={{ ...navItemStyle(activeAccountId !== null), cursor: 'default' }}>My accounts</span>
        <span style={{ ...navItemStyle(false), color: 'var(--muted)' }}>Money moves</span>
        <span style={{ ...navItemStyle(false), color: 'var(--muted)' }}>Shove money around</span>
        <span style={{ ...navItemStyle(false), color: 'var(--muted)' }}>Knobs &amp; buttons</span>
      </div>

      {accounts.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            borderTop: '1px dashed var(--rule)',
            paddingTop: 14,
            fontSize: 15,
          }}
        >
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>Your accounts</span>
          {accounts.map((acc) => (
            <span
              key={acc.account_id}
              onClick={() => navigate(`/accounts/${acc.account_id}`)}
              style={{
                borderLeft: acc.account_id === activeAccountId ? '3px solid var(--ink)' : 'none',
                paddingLeft: acc.account_id === activeAccountId ? 9 : 12,
                color: acc.account_id === activeAccountId ? 'var(--ink)' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {acc.account_type === 'checking' ? 'Checking' : 'Savings'} •••• {acc.account_id.slice(-4)}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button
          onClick={onNewStash}
          className="btn-dashed"
          style={{
            borderRadius: 'var(--r-md)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 16, color: 'var(--ink)' }}>+ New account</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Checking or savings, your call</span>
        </button>
        <div
          onClick={logOut}
          title="Log out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            borderTop: '1px dashed var(--rule)',
            paddingTop: 14,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              flex: 'none',
              border: 'var(--bw) var(--bs) var(--ink)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: 15 }}>{session?.name || 'Account'}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function navItemStyle(active) {
  return {
    border: active ? 'var(--bw) var(--bs) var(--ink)' : 'none',
    borderRadius: 'var(--r-sm)',
    padding: '9px 12px',
    textDecoration: 'none',
    color: 'var(--ink)',
    display: 'block',
  };
}
