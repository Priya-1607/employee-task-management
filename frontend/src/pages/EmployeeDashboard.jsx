import { useEffect, useState } from 'react';
import api from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskCard from '../components/TaskCard';

const STATUSES = ['Todo', 'In Progress', 'Completed'];

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks/my');
      setTasks(data.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    setUpdatingId(taskId);
    setSuccess('');
    try {
      const { data } = await api.patch(`/tasks/my/${taskId}/status`, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data.data : t)));
      setSuccess('Task status updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
        <p className="mt-1 text-slate-600">View and update your assigned tasks</p>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No tasks assigned yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor={`status-${task._id}`} className="text-sm text-slate-600">
                    Update status:
                  </label>
                  <select
                    id={`status-${task._id}`}
                    value={task.status}
                    disabled={updatingId === task._id}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updatingId === task._id && <LoadingSpinner size="sm" />}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
