import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccount, getTransactions,deleteAccount } from '../api/accountsApi';
import Sidebar from './Sidebar';
import MoneyMoveModal from './MoneyMoveModal';
import ConfirmDialog from './ConfirmDialog';
import RiskPanel from './RiskPanel';
import { formatMoney, formatDateTime, txnLabel } from '../utils/format';

const PAGE_SIZE = 7;

export default function AccountDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { session, unregisterAccount } = useAuth();

  const [account, setAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all | in | out
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [acc, txns, siblings] = await Promise.all([
        getAccount(accountId),
        getTransactions(accountId),
        Promise.all(session.accountIds.map((id) => getAccount(id))),
      ]);
      setAccount(acc);
      setAllAccounts(siblings);
      setTransactions(txns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setPage(0);
    } catch (err) {
      setError(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [accountId, session.accountIds]);

  async function handleDelete() {
    await deleteAccount(accountId);
    unregisterAccount(accountId);
    navigate('/');
  }

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 22 }}>
          {error.status === 403 ? 'Access denied' : 'Something went wrong'}
        </span>
        <span style={{ fontSize: 16, color: 'var(--muted)' }}>
          {error.status === 403
            ? "This account doesn't belong to you, so you can't view it."
            : error.message}
        </span>
      </div>
    );
  }

  if (loading || !account) {
    return <div style={{ padding: 40, fontSize: 18, color: 'var(--muted)' }}>Loading…</div>;
  }

  const now = new Date();
  const monthTxns = transactions.filter((t) => {
    const d = new Date(t.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const cameIn = monthTxns.filter((t) => t.txn_type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0);
  const wentOut = monthTxns.filter((t) => t.txn_type === 'WITHDRAW').reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter((t) => {
    if (filter === 'in') return t.txn_type === 'DEPOSIT';
    if (filter === 'out') return t.txn_type === 'WITHDRAW';
    return true;
  });
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const maxPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar accounts={allAccounts} activeAccountId={account.account_id} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            borderBottom: 'var(--bw) var(--bs) var(--ink)',
            padding: '18px var(--pad)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>
              My accounts / {account.account_type === 'checking' ? 'Checking' : 'Savings'}
            </span>
            <span style={{ fontSize: 24 }}>
              {account.account_type === 'checking' ? 'Checking' : 'Savings'} •••• {account.account_id.slice(-4)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => setModal({ direction: 'deposit', account })} disabled={account.is_frozen}>Deposit</button>
            <button className="btn" onClick={() => setModal({ direction: 'withdraw', account })} disabled={account.is_frozen}>Withdraw</button>
            <button className='btn' style={{ color: 'var(--neg)' }} onClick={() => setConfirmingDelete(true)}>Delete account</button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16 }}>
            <div className="card stripe-fill" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>Money you can actually spend</span>
              <span className="num" style={{ fontSize: 'var(--hero)', lineHeight: 1 }}>{formatMoney(account.balance)}</span>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>id {account.account_id.slice(-6)}</span>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>Came in this month</span>
              <span className="num" style={{ fontSize: 'var(--sub)', color: 'var(--pos)' }}>+{formatMoney(cameIn)}</span>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>Went out this month</span>
              <span className="num" style={{ fontSize: 'var(--sub)', color: 'var(--neg)' }}>−{formatMoney(wentOut)}</span>
            </div>
          </div>

          <RiskPanel account={account} onRefresh={load} />

          <div className="card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>Every single money move</span>
              <div style={{ display: 'flex', gap: 9, fontSize: 14, alignItems: 'center' }}>
                {['all', 'in', 'out'].map((f) => (
                  <span
                    key={f}
                    onClick={() => { setFilter(f); setPage(0); }}
                    style={{
                      border: `var(--bw) var(--bs) ${filter === f ? 'var(--ink)' : 'var(--rule)'}`,
                      borderRadius: 20,
                      padding: '4px 13px',
                      color: filter === f ? 'var(--ink)' : 'var(--muted)',
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
                gridTemplateColumns: '.7fr 1.4fr 1.2fr 1fr 1fr',
                fontSize: 14,
                color: 'var(--muted)',
                borderBottom: 'var(--bw) var(--bs) var(--ink)',
                paddingBottom: 7,
              }}
            >
              <span>No.</span><span>When</span><span>What</span>
              <span style={{ textAlign: 'right' }}>How much</span><span style={{ textAlign: 'right' }}>Left over</span>
            </div>

            {pageItems.length === 0 && (
              <span style={{ color: 'var(--muted)', fontSize: 15, padding: '10px 0' }}>No moves in this filter yet.</span>
            )}
            {pageItems.map((t) => (
              <div
                key={t.txn_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '.7fr 1.4fr 1.2fr 1fr 1fr',
                  fontSize: 16,
                  padding: 'var(--row) 0',
                  borderBottom: '1px dashed var(--rule)',
                }}
              >
                <span style={{ color: 'var(--muted)' }}>#{String(t.txn_id).slice(-5)}</span>
                <span>{formatDateTime(t.created_at)}</span>
                <span>{txnLabel(t.txn_type)}</span>
                <span style={{ textAlign: 'right', color: t.txn_type === 'DEPOSIT' ? 'var(--pos)' : 'var(--neg)' }}>
                  {t.txn_type === 'DEPOSIT' ? '+' : '−'}{formatMoney(t.amount)}
                </span>
                <span style={{ textAlign: 'right', color: 'var(--muted)' }}>—</span>
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

      {modal && (
        <MoneyMoveModal
          direction={modal.direction}
          account={modal.account}
          onClose={() => setModal(null)}
          onSuccess={() => load({ silent: true })}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete this account?"
          message="This can't be undone. All transaction history for this account will be lost."
          confirmLabel="Delete account"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={async () => {
            setConfirmingDelete(false);
            await handleDelete();
          }}
        />
      )}
    </div>
  );
}
