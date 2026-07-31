// Mirrors RISK_THRESHOLD in app/services/risk_scoring_service.py.
// Once an account's risk_score reaches this value, the backend treats it
// as high-risk and fires an email alert to the account owner.
export const RISK_THRESHOLD = 100;

// Tiers below RISK_THRESHOLD are a UI-only convenience so people can see a
// score climbing before it actually crosses the backend's alert line.
const TIERS = [
  {
    max: 30,
    key: 'low',
    label: 'Looking good',
    color: 'var(--pos)',
    bg: '#e9f4ee',
    description: 'No unusual activity on this account right now.',
  },
  {
    max: 60,
    key: 'watch',
    label: 'Worth a glance',
    color: '#a3781a',
    bg: '#faf3e0',
    description: 'A little more activity than usual, nothing alarming yet.',
  },
  {
    max: 100,
    key: 'elevated',
    label: 'Getting risky',
    color: '#c2650f',
    bg: '#fbe9dc',
    description: 'Recent deposits or logins have pushed this score up. Keep an eye on it.',
  },
  {
    max: Infinity,
    key: 'high',
    label: 'Flagged as high risk',
    color: 'var(--neg)',
    bg: '#fbe4e2',
    description: "This account crossed our risk threshold — we've emailed you about it.",
  },
];

export function getRiskTier(score) {
  const s = Number(score) || 0;
  return TIERS.find((t) => s < t.max) ?? TIERS[TIERS.length - 1];
}

// 0-1 progress value against the threshold, clamped, for progress-bar UI.
export function getRiskProgress(score) {
  const s = Number(score) || 0;
  return Math.max(0, Math.min(1, s / RISK_THRESHOLD));
}
