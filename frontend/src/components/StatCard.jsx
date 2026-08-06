export default function StatCard({ title, value, subtitle, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {subtitle && (
        <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[color]}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
