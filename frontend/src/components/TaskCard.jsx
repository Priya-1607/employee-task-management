const STATUS_STYLES = {
  Todo: 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-amber-100 text-amber-800',
  Completed: 'bg-green-100 text-green-800',
};

export default function TaskCard({ task, showAssignee = false, actions }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
          {task.description && (
            <p className="mt-2 text-sm text-slate-600">{task.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[task.status]}`}
        >
          {task.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
        {showAssignee && task.assignedTo && (
          <span>Assigned to: {task.assignedTo.name}</span>
        )}
        {task.dueDate && (
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
        {task.createdBy && <span>Created by: {task.createdBy.name}</span>}
      </div>

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export { STATUS_STYLES };
