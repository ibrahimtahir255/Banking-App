import { useState } from 'react';
import { verifyAccount } from '../api/accountsApi';
import { getRiskTier, getRiskProgress, RISK_THRESHOLD } from '../utils/risk';

// Full risk breakdown for a single account: score, progress toward the
// alert threshold, plain-language explanation, and a banner once flagged.
export default function RiskPanel({ account, onRefresh }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const score = account?.risk_score ?? 0;
  const tier = getRiskTier(score);
  const progress = getRiskProgress(score);
  const flagged = tier.key === 'high' || Boolean(account?.is_frozen);
  const roundedScore = Math.round(Number(score) || 0);
  const isFrozen = Boolean(account?.is_frozen);

  async function handleVerify() {
    const trimmedCode = verificationCode.trim();
    if (!trimmedCode) {
      setFeedback({ type: 'error', message: 'Enter the verification code sent to your email.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      await verifyAccount(account.account_id, trimmedCode);
      setVerificationCode('');
      setFeedback({ type: 'success', message: 'Account unlocked. The risk score has been reset to 0.' });
      onRefresh?.();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'That verification code was not accepted.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18 }}>Scam &amp; risk check</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: `1.5px solid ${tier.color}`,
            background: tier.bg,
            color: tier.color,
            borderRadius: 20,
            padding: '3px 12px',
            fontSize: 14,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: tier.color }} />
          {tier.label}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            height: 10,
            borderRadius: 8,
            background: 'var(--fill)',
            border: '1.5px solid var(--rule)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: tier.color,
              transition: 'width .2s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
          <span className="num">Score: {roundedScore}</span>
          <span>Alert line: {RISK_THRESHOLD}</span>
        </div>
      </div>

      <span style={{ fontSize: 15, color: 'var(--muted)' }}>{tier.description}</span>

      {isFrozen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            border: '1.5px solid var(--neg)',
            background: '#fbe4e2',
            color: 'var(--neg)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 14px',
            fontSize: 14,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600 }}>Verification required</span>
          <span>
            This account is frozen until the verification code sent to the email owner is entered.
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{ flex: 1, minWidth: 150, border: '1.5px solid var(--rule)', borderRadius: 'var(--r-sm)', padding: '8px 10px' }}
            />
            <button className="btn btn-primary" onClick={handleVerify} disabled={submitting || !verificationCode.trim()}>
              {submitting ? 'Checking…' : 'Verify'}
            </button>
          </div>
          {feedback.message && (
            <span style={{ color: feedback.type === 'error' ? 'var(--neg)' : 'var(--pos)' }}>{feedback.message}</span>
          )}
        </div>
      )}

      {flagged && !isFrozen && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            border: '1.5px solid var(--neg)',
            background: '#fbe4e2',
            color: 'var(--neg)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 14px',
            fontSize: 14,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>⚠</span>
          <span>
            This account is over the risk threshold. If you don't recognize recent deposits or
            login attempts, consider freezing the account and contacting support.
          </span>
        </div>
      )}
    </div>
  );
}
