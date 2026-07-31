import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUser } from '../api/usersApi';
import { getAccount } from '../api/accountsApi';
import Sidebar from './Sidebar';
import { formatDate, formatMoney } from '../utils/format';

export default function Profile() {
  const { session, logOut } = useAuth();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [userInfo, accs] = await Promise.all([
        getUser(session.userId),
        Promise.all(session.accountIds.map((id) => getAccount(id))),
      ]);
      if (!cancelled) {
        setUser(userInfo);
        setAccounts(accs);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session.userId, session.accountIds]);

  const initials = (session?.name || session?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar accounts={accounts} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            borderBottom: 'var(--bw) var(--bs) var(--ink)',
            padding: '18px var(--pad)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <span style={{ fontSize: 15, color: 'var(--muted)' }}>Your info &amp; account settings</span>
          <span style={{ fontSize: 24 }}>Profile settings</span>
        </div>

        <div style={{ flex: 1, padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)', maxWidth: 480 }}>
          {loading ? (
            <span style={{ fontSize: 18, color: 'var(--muted)' }}>Loading…</span>
          ) : (
            <>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      flex: 'none',
                      border: 'var(--bw) var(--bs) var(--ink)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 19,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: 19 }}>{user?.name || session?.name}</span>
                    <span style={{ fontSize: 15, color: 'var(--muted)' }}>{user?.email || session?.email}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed var(--rule)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15 }}>
                  <Row label="Member since" value={formatDate(user?.created_at)} />
                  <Row label="Accounts" value={`${accounts.length} · ${formatMoney(totalBalance)} total`} />
                </div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 16 }}>Session</span>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Signed in as {user?.email || session?.email} on this device.
                </span>
                <button className="btn" style={{ color: 'var(--neg)', alignSelf: 'flex-start' }} onClick={logOut}>
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
