import { getRiskTier } from '../utils/risk';

// Small pill showing an account's risk tier. Drop it next to a balance
// or account label anywhere in the app.
export default function RiskBadge({ score, showScore = false }) {
  const tier = getRiskTier(score);

  return (
    <span
      title={tier.description}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        border: `1.5px solid ${tier.color}`,
        background: tier.bg,
        color: tier.color,
        borderRadius: 20,
        padding: '2px 10px',
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: tier.color,
          flex: 'none',
        }}
      />
      {tier.label}
      {showScore && <span style={{ opacity: 0.75 }}>· {Math.round(Number(score) || 0)}</span>}
    </span>
  );
}
