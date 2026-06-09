import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  HiOutlineUserPlus,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineEnvelope,
  HiOutlineLockClosed
} from 'react-icons/hi2';
import { format } from 'date-fns';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users');
      if (data.success) setUsers(data.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const validateForm = () => {
    const errs = {};
    if (!form.username || form.username.trim().length < 3)
      errs.username = 'Username must be at least 3 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Enter a valid email';
    if (!form.password || form.password.length < 4)
      errs.password = 'Password must be at least 4 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await API.post('/users', form);
      if (data.success) {
        setSuccess(`User "${data.data.username}" created successfully!`);
        setShowModal(false);
        setForm({ username: '', email: '', password: '', role: 'admin' });
        setFormErrors({});
        fetchUsers();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.msg
        || 'Failed to create user';
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      setDeleteModal(null);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(''), 4000);
    }
  };

  const openModal = () => {
    setForm({ username: 'darsh', email: 'darsh@spis.com', password: 'darsh', role: 'admin' });
    setFormErrors({});
    setShowModal(true);
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Title */}
      <div className="page-title">
        <h1>User Management</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openModal} id="add-user-btn">
            <HiOutlineUserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✅ {success}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSuccess('')}><HiOutlineXMark size={14} /></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>❌ {error}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setError('')}><HiOutlineXMark size={14} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineUser size={22} /></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><HiOutlineShieldCheck size={22} /></div>
          <div className="stat-info">
            <h3>Admins</h3>
            <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><HiOutlineUser size={22} /></div>
          <div className="stat-info">
            <h3>Regular Users</h3>
            <div className="stat-value">{users.filter(u => u.role === 'user').length}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <HiOutlineMagnifyingGlass className="search-icon" />
        <input
          type="text"
          className="form-input"
          placeholder="Search users by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-users"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading users...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3>No Users Found</h3>
          <p>Click "Add User" to create the first admin user.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openModal}>
            <HiOutlineUserPlus size={16} /> Add User
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-500), var(--primary-500))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '0.8rem', color: 'white', flexShrink: 0
                      }}>
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600' }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-accent'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {u.role === 'admin' ? <HiOutlineShieldCheck size={12} /> : <HiOutlineUser size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-icon"
                      title="Delete User"
                      onClick={() => setDeleteModal(u)}
                      style={{ color: 'var(--danger-400)' }}
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '460px', width: '100%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add New User</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Username */}
              <div className="form-group">
                <label className="form-label" htmlFor="new-username">
                  <HiOutlineUser size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Username
                </label>
                <input
                  id="new-username"
                  type="text"
                  className={`form-input ${formErrors.username ? 'input-error' : ''}`}
                  placeholder="e.g. darsh"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  autoFocus
                />
                {formErrors.username && <span className="form-error">{formErrors.username}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="new-email">
                  <HiOutlineEnvelope size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Email
                </label>
                <input
                  id="new-email"
                  type="email"
                  className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                  placeholder="e.g. darsh@spis.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  <HiOutlineLockClosed size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className={`form-input ${formErrors.password ? 'input-error' : ''}`}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                {formErrors.password && <span className="form-error">{formErrors.password}</span>}
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label" htmlFor="new-role">
                  <HiOutlineShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Role
                </label>
                <select
                  id="new-role"
                  className="form-input"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} id="submit-user-btn">
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px' }}>Delete User</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{deleteModal.username}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteModal._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
