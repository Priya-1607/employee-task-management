import { useEffect, useState } from 'react';
import api from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import EmployeeForm from '../components/EmployeeForm';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees');
      setEmployees(data.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (payload) => {
    await api.post('/employees', payload);
    setModalOpen(false);
    await fetchEmployees();
  };

  const handleUpdate = async (payload) => {
    await api.put(`/employees/${editingEmployee._id}`, payload);
    setEditingEmployee(null);
    await fetchEmployees();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;

    try {
      await api.delete(`/employees/${id}`);
      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-slate-600">Manage your team members</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add Employee
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No employees yet. Add your first employee.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employee.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          employee.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => setEditingEmployee(employee)}
                        className="mr-3 font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(employee._id)}
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} title="Add Employee" onClose={() => setModalOpen(false)}>
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          submitLabel="Create Employee"
        />
      </Modal>

      <Modal
        isOpen={!!editingEmployee}
        title="Edit Employee"
        onClose={() => setEditingEmployee(null)}
      >
        {editingEmployee && (
          <EmployeeForm
            initialData={editingEmployee}
            onSubmit={handleUpdate}
            onCancel={() => setEditingEmployee(null)}
            submitLabel="Update Employee"
          />
        )}
      </Modal>
    </div>
  );
}
