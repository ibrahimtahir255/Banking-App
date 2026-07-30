import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccount, getTransactions, createAccount } from '../api/accountsApi';
import Sidebar from './Sidebar';
import MoneyMoveModal from './MoneyMoveModal';
import { formatMoney, formatDate, txnLabel } from '../utils/format';

export default function Overview() {
  const { session, registerNewAccount } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { direction, account } | null
  const [creating, setCreating] = useState(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const accs = await Promise.all(session.accountIds.map((id) => getAccount(id)));
    setAccounts(accs);

    const txnLists = await Promise.all(accs.map((a) => getTransactions(a.account_id)));
    const merged = txnLists
      .flatMap((list, i) => list.map((t) => ({ ...t, accountType: accs[i].account_type })))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setTransactions(merged);
    if (!silent) setLoading(false);
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
  const now = new Date();
  const monthTxns = transactions.filter((t) => {
    const d = new Date(t.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const cameIn = monthTxns.filter((t) => t.txn_type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0);
  const wentOut = monthTxns.filter((t) => t.txn_type === 'WITHDRAW').reduce((s, t) => s + t.amount, 0);

  const primaryAccount = accounts[0];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontWeight: 500 }}>
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
            <span style={{ fontSize: 15, color: 'var(--muted)' }}>
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span style={{ fontSize: 24 }}>Dashboard</span>
          </div>
          {primaryAccount && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span
                style={{
                  border: 'var(--bw) var(--bs) var(--rule)',
                  borderRadius: 'var(--r-sm)',
                  padding: '9px 20px',
                  fontSize: 15,
                  color: 'var(--muted)',
                }}
              >
                Find a money move…
              </span>
              <button className="btn btn-primary" onClick={() => setModal({ direction: 'deposit', account: primaryAccount })}>
                Deposit
              </button>
              <button className="btn" onClick={() => setModal({ direction: 'withdraw', account: primaryAccount })}>
                Withdraw
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          {accounts.length === 0 ? (
            <EmptyState onCreate={handleNewStash} creating={creating} />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16 }}>
                <div className="card stripe-fill" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <span style={{ fontSize: 15, color: 'var(--muted)' }}>Total Money</span>
                  <span className="num" style={{ fontSize: 'var(--hero)', lineHeight: 1 }}>{formatMoney(totalBalance)}</span>
                  <span style={{ fontSize: 15, color: 'var(--muted)' }}>{accounts.length} accounts · just now</span>
                </div>
                {accounts.map((acc) => (
                  <div key={acc.account_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ fontSize: 15, color: 'var(--muted)' }}>
                      {acc.account_type === 'checking' ? 'Checking' : 'Savings'} •••• {acc.account_id.slice(-4)}
                    </span>
                    <span className="num" style={{ fontSize: 'var(--sub)', lineHeight: 1.1 }}>{formatMoney(acc.balance)}</span>
                    <span
                      onClick={() => navigate(`/accounts/${acc.account_id}`)}
                      style={{ marginTop: 'auto', fontSize: 15, color: 'var(--accent)', cursor: 'pointer' }}
                    >
                      Peek inside →
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: 16 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
                  <span style={{ fontSize: 18 }}>Stuff that just happened</span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.1fr 1fr .9fr 1fr',
                      fontSize: 14,
                      color: 'var(--muted)',
                      borderBottom: 'var(--bw) var(--bs) var(--ink)',
                      paddingBottom: 7,
                    }}
                  >
                    <span>When</span><span>What</span><span>Account</span>
                    <span style={{ textAlign: 'right' }}>How much</span><span style={{ textAlign: 'right' }}>Left over</span>
                  </div>
                  {transactions.length === 0 && (
                    <span style={{ color: 'var(--muted)', fontSize: 15, padding: '10px 0' }}>Nothing yet — make your first move above.</span>
                  )}
                  {transactions.slice(0, 6).map((t) => (
                    <div
                      key={t.txn_id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1.1fr 1fr .9fr 1fr',
                        fontSize: 16,
                        padding: 'var(--row) 0',
                        borderBottom: '1px dashed var(--rule)',
                      }}
                    >
                      <span>{formatDate(t.created_at)}</span>
                      <span>{txnLabel(t.txn_type)}</span>
                      <span style={{ textTransform: 'capitalize' }}>{t.accountType}</span>
                      <span style={{ textAlign: 'right', color: t.txn_type === 'DEPOSIT' ? 'var(--pos)' : 'var(--neg)' }}>
                        {t.txn_type === 'DEPOSIT' ? '+' : '−'}{formatMoney(t.amount)}
                      </span>
                      <span style={{ textAlign: 'right', color: 'var(--muted)' }}>—</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>Two-click stuff</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 16 }}>
                      <button className="btn" onClick={() => setModal({ direction: 'deposit', account: primaryAccount })}>
                        ↓ Deposit
                      </button>
                      <button className="btn" onClick={() => setModal({ direction: 'withdraw', account: primaryAccount })}>
                        ↑ Withdraw
                      </button>
                    </div>
                  </div>
                  <div className="card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <span style={{ fontSize: 18 }}>This month so far</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                      <span style={{ color: 'var(--muted)' }}>Came in</span>
                      <span style={{ color: 'var(--pos)' }}>+{formatMoney(cameIn)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                      <span style={{ color: 'var(--muted)' }}>Went out</span>
                      <span style={{ color: 'var(--neg)' }}>−{formatMoney(wentOut)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {modal && (
        <MoneyMoveModal
          direction={modal.direction}
          account={modal.account}
          onClose={() => setModal(null)}
          onSuccess={() => load({ silent: true })}
        />
      )}
    </div>
  );
}

function EmptyState({ onCreate, creating }) {
  return (
    <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 13, maxWidth: 480 }}>
      <span style={{ fontSize: 20 }}>Let's create your first account</span>
      <span style={{ fontSize: 16, color: 'var(--muted)' }}>
        Deposit money, withdraw money, and watch every move show up right here.
      </span>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" style={{ flex: 1 }} disabled={creating} onClick={() => onCreate('checking')}>Checking</button>
        <button className="btn" style={{ flex: 1 }} disabled={creating} onClick={() => onCreate('savings')}>Savings</button>
      </div>
    </div>
  );
}
