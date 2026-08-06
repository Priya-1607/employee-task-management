import { useEffect, useState } from 'react';
import api from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, employeesRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/employees'),
      ]);
      setTasks(tasksRes.data.data);
      setEmployees(employeesRes.data.data.filter((e) => e.isActive));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (payload) => {
    await api.post('/tasks', payload);
    setModalOpen(false);
    await fetchData();
  };

  const handleUpdate = async (payload) => {
    await api.put(`/tasks/${editingTask._id}`, payload);
    setEditingTask(null);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-slate-600">Create, assign, and manage tasks First add Employee from 
Employees in nav bar then create task</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={employees.length === 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create Task
        </button>
      </div>

      {employees.length === 0 && !loading && (
        <Alert
          type="info"
          message="Add at least one active employee before creating tasks."
        />
      )}

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No tasks yet. Create your first task.
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                showAssignee
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingTask(task)}
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </>
                }
              />
            ))
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} title="Create Task" onClose={() => setModalOpen(false)}>
        <TaskForm
          employees={employees}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          submitLabel="Create Task"
        />
      </Modal>

      <Modal isOpen={!!editingTask} title="Edit Task" onClose={() => setEditingTask(null)}>
        {editingTask && (
          <TaskForm
            initialData={editingTask}
            employees={employees}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            submitLabel="Update Task"
          />
        )}
      </Modal>
    </div>
  );
}
