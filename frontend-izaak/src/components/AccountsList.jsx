import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccount, createAccount } from '../api/accountsApi';
import Sidebar from './Sidebar';
import RiskBadge from './RiskBadge';
import EmptyAccountsState from './EmptyAccountsState';
import { formatMoney, formatDate } from '../utils/format';

export default function AccountsList() {
  const { session, registerNewAccount } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const accs = await Promise.all(session.accountIds.map((id) => getAccount(id)));
    setAccounts(accs);
    setLoading(false);
  }, [session.accountIds]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleNewStash(type) {
    setCreating(true);
    try {
      const acc = await createAccount(session.userId, type);
      registerNewAccount(acc.account_id);
      setAccounts((prev) => [...prev, acc]);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 40, fontSize: 18, color: 'var(--muted)' }}>Loading…</div>;
  }

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar accounts={accounts} onNewStash={handleNewStash} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            borderBottom: 'var(--bw) var(--bs) var(--ink)',
            padding: '18px var(--pad)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 15, color: 'var(--muted)' }}>Every account, in one place</span>
            <span style={{ fontSize: 24 }}>My accounts</span>
          </div>
          {accounts.length > 0 && (
            <span style={{ fontSize: 15, color: 'var(--muted)' }}>
              {accounts.length} account{accounts.length === 1 ? '' : 's'} · {formatMoney(totalBalance)} total
            </span>
          )}
        </div>

        <div style={{ flex: 1, padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          {accounts.length === 0 ? (
            <EmptyAccountsState onCreate={handleNewStash} creating={creating} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
              {accounts.map((acc) => (
                <div
                  key={acc.account_id}
                  className="card"
                  onClick={() => navigate(`/accounts/${acc.account_id}`)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, color: 'var(--muted)' }}>
                      {acc.account_type === 'checking' ? 'Checking' : 'Savings'} •••• {acc.account_id.slice(-4)}
                    </span>
                    <RiskBadge score={acc.risk_score} />
                  </div>
                  <span className="num" style={{ fontSize: 'var(--sub)', lineHeight: 1.1 }}>{formatMoney(acc.balance)}</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    Opened {formatDate(acc.created_at)}
                  </span>
                  <span style={{ marginTop: 'auto', fontSize: 15, color: 'var(--accent)' }}>Peek inside →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
