import { getRiskTier, getRiskProgress, RISK_THRESHOLD } from '../utils/risk';

// Full risk breakdown for a single account: score, progress toward the
// alert threshold, plain-language explanation, and a banner once flagged.
export default function RiskPanel({ score }) {
  const tier = getRiskTier(score);
  const progress = getRiskProgress(score);
  const flagged = tier.key === 'high';
  const roundedScore = Math.round(Number(score) || 0);

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

      {flagged && (
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
