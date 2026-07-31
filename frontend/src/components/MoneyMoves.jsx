import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccount, getTransactions } from '../api/accountsApi';
import Sidebar from './Sidebar';
import { formatMoney, formatDateTime, txnLabel } from '../utils/format';

const PAGE_SIZE = 10;

export default function MoneyMoves() {
  const { session } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // all | in | out
  const [accountFilter, setAccountFilter] = useState('all');
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const accs = await Promise.all(session.accountIds.map((id) => getAccount(id)));
    setAccounts(accs);

    const txnLists = await Promise.all(accs.map((a) => getTransactions(a.account_id)));
    const merged = txnLists
      .flatMap((list, i) => list.map((t) => ({ ...t, accountType: accs[i].account_type, accountId: accs[i].account_id })))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setTransactions(merged);
    setLoading(false);
  }, [session.accountIds]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div style={{ padding: 40, fontSize: 18, color: 'var(--muted)' }}>Loading…</div>;
  }

  const filtered = transactions
    .filter((t) => typeFilter === 'all' || (typeFilter === 'in' && t.txn_type === 'DEPOSIT') || (typeFilter === 'out' && t.txn_type === 'WITHDRAW'))
    .filter((t) => accountFilter === 'all' || t.accountId === accountFilter);

  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const maxPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1);

  function setTypeAndResetPage(f) {
    setTypeFilter(f);
    setPage(0);
  }

  function setAccountAndResetPage(id) {
    setAccountFilter(id);
    setPage(0);
  }

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
          <span style={{ fontSize: 15, color: 'var(--muted)' }}>Every deposit and withdrawal, everywhere</span>
          <span style={{ fontSize: 24 }}>Money moves</span>
        </div>

        <div style={{ flex: 1, padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          <div className="card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 9, fontSize: 14, alignItems: 'center' }}>
                {['all', 'in', 'out'].map((f) => (
                  <span
                    key={f}
                    onClick={() => setTypeAndResetPage(f)}
                    style={{
                      border: `var(--bw) var(--bs) ${typeFilter === f ? 'var(--ink)' : 'var(--rule)'}`,
                      borderRadius: 20,
                      padding: '4px 13px',
                      color: typeFilter === f ? 'var(--ink)' : 'var(--muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {f === 'all' ? 'All' : f === 'in' ? 'Just the ins' : 'Just the outs'}
                  </span>
                ))}
              </div>

              {accounts.length > 1 && (
                <select
                  value={accountFilter}
                  onChange={(e) => setAccountAndResetPage(e.target.value)}
                  style={{
                    border: 'var(--bw) var(--bs) var(--rule)',
                    borderRadius: 'var(--r-sm)',
                    padding: '7px 10px',
                    fontSize: 14,
                    background: 'var(--paper)',
                  }}
                >
                  <option value="all">All accounts</option>
                  {accounts.map((a) => (
                    <option key={a.account_id} value={a.account_id}>
                      {a.account_type === 'checking' ? 'Checking' : 'Savings'} •••• {a.account_id.slice(-4)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.3fr 1fr 1fr',
                fontSize: 14,
                color: 'var(--muted)',
                borderBottom: 'var(--bw) var(--bs) var(--ink)',
                paddingBottom: 7,
              }}
            >
              <span>When</span><span>Account</span><span>What</span>
              <span style={{ textAlign: 'right' }}>How much</span>
            </div>

            {pageItems.length === 0 && (
              <span style={{ color: 'var(--muted)', fontSize: 15, padding: '10px 0' }}>No moves in this filter yet.</span>
            )}
            {pageItems.map((t) => (
              <div
                key={t.txn_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.3fr 1fr 1fr',
                  fontSize: 16,
                  padding: 'var(--row) 0',
                  borderBottom: '1px dashed var(--rule)',
                }}
              >
                <span>{formatDateTime(t.created_at)}</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {t.accountType} •••• {t.accountId.slice(-4)}
                </span>
                <span>{txnLabel(t.txn_type)}</span>
                <span style={{ textAlign: 'right', color: t.txn_type === 'DEPOSIT' ? 'var(--pos)' : 'var(--neg)' }}>
                  {t.txn_type === 'DEPOSIT' ? '+' : '−'}{formatMoney(t.amount)}
                </span>
              </div>
            ))}

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, color: 'var(--muted)' }}>
              <span>Showing {pageItems.length} of {filtered.length}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={{ border: '1.5px solid var(--rule)', borderRadius: 'var(--r-sm)', padding: '6px 12px', cursor: page > 0 ? 'pointer' : 'default', opacity: page > 0 ? 1 : .4 }}
                >←</span>
                <span
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  style={{ border: '1.5px solid var(--rule)', borderRadius: 'var(--r-sm)', padding: '6px 12px', cursor: page < maxPage ? 'pointer' : 'default', opacity: page < maxPage ? 1 : .4 }}
                >→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
