import { useState } from 'react';
import { deposit, withdraw } from '../api/accountsApi';
import { formatMoney } from '../utils/format';

const QUICK_AMOUNTS = [50, 100, 500, 1000];

// direction: 'deposit' | 'withdraw'
export default function MoneyMoveModal({ direction, account, onClose, onSuccess }) {
  const [step, setStep] = useState('amount'); // amount -> confirm -> receipt
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatedAccount, setUpdatedAccount] = useState(null);

  const isDeposit = direction === 'deposit';
  const parsedAmount = parseFloat(amount) || 0;
  const projected = isDeposit ? account.balance + parsedAmount : account.balance - parsedAmount;

  function goToConfirm(e) {
    e.preventDefault();
    setError('');
    if (parsedAmount <= 0) {
      setError('Enter an amount above $0.');
      return;
    }
    if (!isDeposit && parsedAmount > account.balance) {
      setError(`Whoa there — you've only got ${formatMoney(account.balance)}. Try a smaller number.`);
      return;
    }
    setStep('confirm');
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    try {
      const result = isDeposit
        ? await deposit(account.account_id, parsedAmount)
        : await withdraw(account.account_id, parsedAmount);
      setUpdatedAccount(result);
      setStep('receipt');
      onSuccess?.(result);
    } catch (err) {
      setError(err.message);
      setStep('amount');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,26,26,.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: 480,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: '0 18px 40px rgba(0,0,0,.14)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'amount' && (
          <>
            <Header title={isDeposit ? 'Chuck money in' : 'Yank money out'} onClose={onClose} />
            <form onSubmit={goToConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontSize: 15, color: 'var(--muted)' }}>
                  {isDeposit ? 'Into which stash?' : 'Out of which stash?'}
                </span>
                <div
                  style={{
                    border: 'var(--bw) var(--bs) var(--ink)',
                    borderRadius: 'var(--r-sm)',
                    padding: '12px 14px',
                    fontSize: 17,
                  }}
                >
                  {account.account_type === 'checking' ? 'Checking' : 'Savings'} •••• {account.account_id.slice(-4)} ·{' '}
                  {formatMoney(account.balance)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontSize: 15, color: 'var(--muted)' }}>How much?</span>
                <div
                  className="stripe-fill"
                  style={{
                    border: 'var(--bw) var(--bs) var(--ink)',
                    borderRadius: 'var(--r-sm)',
                    padding: '14px 16px',
                  }}
                >
                  <input
                    autoFocus
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

              <div
                style={{
                  borderTop: '1px dashed var(--rule)',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 17,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>You'll be sitting on</span>
                <span>{formatMoney(Math.max(0, projected))}</span>
              </div>

              {error && <ErrorBanner message={error} />}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={onClose} className="btn">
                  Nah, never mind
                </button>
                <button type="submit" className="btn btn-primary">
                  Looks good, next
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'confirm' && (
          <>
            <span style={{ fontSize: 20 }}>Hold up — you sure?</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 17 }}>
              <Row label="How much" value={<span className="num" style={{ fontSize: 24 }}>{formatMoney(parsedAmount)}</span>} />
              <Row label={isDeposit ? 'Into' : 'Out of'} value={`${account.account_type === 'checking' ? 'Checking' : 'Savings'} •••• ${account.account_id.slice(-4)}`} />
              <Row label="When" value={new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} />
              <div style={{ borderTop: '1px dashed var(--rule)', paddingTop: 10 }}>
                <Row label="You'll have" value={formatMoney(projected)} />
              </div>
            </div>
            {error && <ErrorBanner message={error} />}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn" onClick={() => setStep('amount')}>Go back</button>
              <button className="btn btn-primary" disabled={submitting} onClick={handleConfirm}>
                {submitting ? 'Doing it…' : 'Yep, do it!'}
              </button>
            </div>
          </>
        )}

        {step === 'receipt' && updatedAccount && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                border: 'var(--bw) var(--bs) var(--ink)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              ✓
            </div>
            <span className="num" style={{ fontSize: 28 }}>
              Boom! {formatMoney(parsedAmount)} {isDeposit ? 'in.' : 'out.'}
            </span>
            <span style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 320 }}>
              {account.account_type === 'checking' ? 'Checking' : 'Savings'} •••• {account.account_id.slice(-4)} is{' '}
              {isDeposit ? 'fatter' : 'lighter'} now: {formatMoney(updatedAccount.balance)}.
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={onClose}>Take me home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ title, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 21 }}>{title}</span>
      <span style={{ fontSize: 20, color: 'var(--muted)', cursor: 'pointer' }} onClick={onClose}>×</span>
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

function ErrorBanner({ message }) {
  return (
    <div
      style={{
        border: 'var(--bw) var(--bs) var(--neg)',
        borderRadius: 'var(--r-sm)',
        padding: '11px 14px',
        fontSize: 15,
        color: 'var(--neg)',
      }}
    >
      {message}
    </div>
  );
}
