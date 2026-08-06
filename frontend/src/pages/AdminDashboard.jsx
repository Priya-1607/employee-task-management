import { useEffect, useState } from 'react';
import api from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tasks/dashboard/stats');
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600">Overview of employees and task progress</p>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Employees" value={stats.totalEmployees} color="indigo" />
          <StatCard title="Total Tasks" value={stats.totalTasks} color="slate" />
          <StatCard
            title="In Progress"
            value={stats.tasksByStatus['In Progress']}
            color="amber"
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle={`${stats.tasksByStatus.Completed} completed`}
            color="green"
          />
        </div>
      )}

      {stats && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tasks by Status</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status} className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{status}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
