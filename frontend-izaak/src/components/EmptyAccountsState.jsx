export default function EmptyAccountsState({ onCreate, creating }) {
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
