export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      <div className="flex items-start justify-between gap-3">
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="font-semibold opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
