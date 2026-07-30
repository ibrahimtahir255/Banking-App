export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
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
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          width: 380,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 18px 40px rgba(0,0,0,.14)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: 20 }}>{title}</span>
        <span style={{ fontSize: 16, color: 'var(--muted)' }}>{message}</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--neg)', borderColor: 'var(--neg)' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
