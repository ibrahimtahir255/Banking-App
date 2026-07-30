export function formatMoney(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, ${d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function txnLabel(txnType) {
  return txnType === 'DEPOSIT' ? 'Deposit' : 'Withdrawal';
}
