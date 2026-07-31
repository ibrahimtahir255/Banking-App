import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccount, getTransactions, withdraw, deposit } from '../api/accountsApi';
import Sidebar from './Sidebar';
import { formatMoney, formatDateTime, txnLabel } from '../utils/format';

const QUICK_AMOUNTS = [50, 100, 500, 1000];
const PAGE_SIZE = 8;

function accountLabel(acc) {
  return `${acc.account_type === 'checking' ? 'Checking' : 'Savings'} •••• ${acc.account_id.slice(-4)} · ${formatMoney(acc.balance)}`;
}

export default function Transfer() {
  const { session } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all'); // all | in | out
  const [page, setPage] = useState(0);

  const loadTransactions = useCallback(async (accs) => {
    const txnLists = await Promise.all(accs.map((a) => getTransactions(a.account_id)));
    const merged = txnLists
      .flatMap((list, i) => list.map((t) => ({ ...t, accountType: accs[i].account_type, accountId: accs[i].account_id })))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setTransactions(merged);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const accs = await Promise.all(session.accountIds.map((id) => getAccount(id)));
    setAccounts(accs);
    setFromId((prev) => prev || accs[0]?.account_id || '');
    setToId((prev) => prev || accs.find((a) => a.account_id !== accs[0]?.account_id)?.account_id || '');
    await loadTransactions(accs);
    setLoading(false);
  }, [session.accountIds, loadTransactions]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div style={{ padding: 40, fontSize: 18, color: 'var(--muted)' }}>Loading…</div>;
  }

  const fromAccount = accounts.find((a) => a.account_id === fromId);
  const toAccount = accounts.find((a) => a.account_id === toId);
  const parsedAmount = parseFloat(amount) || 0;

  const filtered = transactions.filter(
    (t) => typeFilter === 'all' || (typeFilter === 'in' && t.txn_type === 'DEPOSIT') || (typeFilter === 'out' && t.txn_type === 'WITHDRAW')
  );
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const maxPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1);

  function setTypeAndResetPage(f) {
    setTypeFilter(f);
    setPage(0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!fromId || !toId) {
      setError('Pick both accounts.');
      return;
    }
    if (fromId === toId) {
      setError("Pick two different accounts — money can't move to itself.");
      return;
    }
    if (parsedAmount <= 0) {
      setError('Enter an amount above $0.');
      return;
    }
    if (fromAccount && parsedAmount > fromAccount.balance) {
      setError(`You've only got ${formatMoney(fromAccount.balance)} in that account.`);
      return;
    }

    setSubmitting(true);
    try {
      // Pull the money out first — if the deposit leg fails, put it back
      // so nothing just vanishes between the two accounts.
      const updatedFrom = await withdraw(fromId, parsedAmount);
      let updatedTo;
      try {
        updatedTo = await deposit(toId, parsedAmount);
      } catch (depositErr) {
        await deposit(fromId, parsedAmount).catch(() => {});
        throw depositErr;
      }

      const nextAccounts = accounts.map((a) => {
        if (a.account_id === updatedFrom.account_id) return updatedFrom;
        if (a.account_id === updatedTo.account_id) return updatedTo;
        return a;
      });
      setAccounts(nextAccounts);
      setResult({ from: updatedFrom, to: updatedTo, amount: parsedAmount });
      setAmount('');
      setPage(0);
      await loadTransactions(nextAccounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
          <span style={{ fontSize: 15, color: 'var(--muted)' }}>Move money between your own accounts</span>
          <span style={{ fontSize: 24 }}>Shove money around</span>
        </div>

        <div style={{ flex: 1, padding: 'var(--pad)', display: 'grid', gridTemplateColumns: accounts.length < 2 ? '1fr' : '440px 1fr', gap: 'var(--gap)', minHeight: 0 }}>
          {accounts.length < 2 ? (
            <div className="card" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 18 }}>You need two accounts for this</span>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>
                Open a second account (checking or savings) from the sidebar, then come back here to move
                money between them.
              </span>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="card" style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <span style={{ fontSize: 15, color: 'var(--muted)' }}>Out of which account?</span>
                  <select
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    style={{ border: 'var(--bw) var(--bs) var(--ink)', borderRadius: 'var(--r-sm)', padding: '12px 14px', fontSize: 16, background: 'var(--paper)' }}
                  >
                    {accounts.map((a) => (
                      <option key={a.account_id} value={a.account_id}>{accountLabel(a)}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <span style={{ fontSize: 15, color: 'var(--muted)' }}>Into which account?</span>
                  <select
                    value={toId}
                    onChange={(e) => setToId(e.target.value)}
                    style={{ border: 'var(--bw) var(--bs) var(--ink)', borderRadius: 'var(--r-sm)', padding: '12px 14px', fontSize: 16, background: 'var(--paper)' }}
                  >
                    {accounts.map((a) => (
                      <option key={a.account_id} value={a.account_id} disabled={a.account_id === fromId}>
                        {accountLabel(a)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <span style={{ fontSize: 15, color: 'var(--muted)' }}>How much?</span>
                  <div
                    className="stripe-fill"
                    style={{ border: 'var(--bw) var(--bs) var(--ink)', borderRadius: 'var(--r-sm)', padding: '14px 16px' }}
                  >
                    <input
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      style={{ border: 'none', background: 'transparent', fontSize: 34, width: '100%' }}
                      className="num"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 15 }}>
                    {QUICK_AMOUNTS.map((q) => (
                      <span
                        key={q}
                        onClick={() => setAmount(String(q))}
                        style={{
                          border: `var(--bw) var(--bs) ${String(q) === amount ? 'var(--ink)' : 'var(--rule)'}`,
                          borderRadius: 20,
                          padding: '5px 14px',
                          color: String(q) === amount ? 'var(--ink)' : 'var(--muted)',
                          cursor: 'pointer',
                        }}
                      >
                        ${q}
                      </span>
                    ))}
                  </div>
                </div>

                {error && (
                  <div
                    style={{ border: 'var(--bw) var(--bs) var(--neg)', borderRadius: 'var(--r-sm)', padding: '11px 14px', fontSize: 15, color: 'var(--neg)' }}
                  >
                    {error}
                  </div>
                )}

                {result && (
                  <div
                    style={{ border: 'var(--bw) var(--bs) var(--pos)', borderRadius: 'var(--r-sm)', padding: '11px 14px', fontSize: 15, color: 'var(--pos)' }}
                  >
                    Moved {formatMoney(result.amount)} — {accountLabel(result.from)} → {accountLabel(result.to)}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Moving…' : 'Move the money'}
                </button>
              </form>

              <div className="card" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>Every money move on these accounts</span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
