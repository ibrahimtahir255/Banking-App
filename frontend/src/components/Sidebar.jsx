import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/', label: 'Home base', exact: true },
  { to: '/accounts', label: 'My accounts' },
  { to: '/money-moves', label: 'Money moves' },
  { to: '/transfer', label: 'Shove money around' },
  { to: '/profile', label: 'Profile settings' },
];

export default function Sidebar({ accounts = [], activeAccountId = null, onNewStash }) {
  const { session, logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [choosing, setChoosing] = useState(false)

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
        {NAV_LINKS.map(({ to, label, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <Link key={to} to={to} style={navItemStyle(active)}>{label}</Link>
          );
        })}
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
        {choosing ? (
          <div>
            <button
              className="btn"
              style= {{flex:1}}
              onClick={() => {
                onNewStash('checking');
                setChoosing(false);
              }}
            >
              Checking
            </button>

            <button
              className='btn'
              style={{flex:1}}
              onClick={() => {
                onNewStash('savings');
                setChoosing(false);
              }}
            >
              Savings
            </button>
          </div>
        ): (
        <button
        onClick={() => setChoosing(true)}
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

        )}

        <div style={{ borderTop: '1px dashed var(--rule)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            onClick={() => navigate('/profile')}
            title="Profile settings"
            style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
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

          <span
            onClick={logOut}
            title="Log out"
            style={{ fontSize: 14, color: 'var(--muted)', cursor: 'pointer', paddingLeft: 41 }}
          >
            Log out
          </span>
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
