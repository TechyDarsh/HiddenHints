import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import {
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineExclamationTriangle,
  HiOutlinePlusCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineQrCode
} from 'react-icons/hi2';
import { format } from 'date-fns';
import QRCode from 'qrcode';

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products', { params: { search, limit: 100 } });
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      setDeleteModal(null);
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkUploading(true);
    setBulkResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await API.post('/products/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkResult(data.data);
      fetchProducts();
    } catch (err) {
      setBulkResult({ error: err.response?.data?.message || 'Upload failed' });
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  const showQrCode = async (product) => {
    setQrModal(product);
    try {
      const url = await QRCode.toDataURL(product.code, {
        width: 300,
        margin: 2,
        color: { dark: '#1a1a3e', light: '#ffffff' }
      });
      setQrDataUrl(url);
    } catch {
      setQrDataUrl('');
    }
  };

  const downloadQr = (productName) => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_${productName.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const isExpired = (date) => new Date() > new Date(date);

  const stats = {
    total: products.length,
    expired: products.filter(p => isExpired(p.expiry_date)).length,
    scans: products.reduce((sum, p) => sum + (p.scanCount || 0), 0),
    categories: [...new Set(products.map(p => p.category))].length
  };

  return (
    <div className="page-container">
      {/* Page Title */}
      <div className="page-title">
        <h1>Admin Dashboard</h1>
        <div className="page-actions">
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <HiOutlineArrowUpTray size={16} />
            {bulkUploading ? 'Uploading...' : 'Bulk CSV'}
            <input type="file" accept=".csv" onChange={handleBulkUpload} hidden />
          </label>
          <Link to="/products/new" className="btn btn-primary">
            <HiOutlinePlusCircle size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Bulk Upload Result */}
      {bulkResult && (
        <div className={`alert ${bulkResult.error ? 'alert-danger' : 'alert-success'}`}>
          {bulkResult.error ? bulkResult.error : (
            `Uploaded: ${bulkResult.inserted} products, ${bulkResult.skipped} skipped, ${bulkResult.errors} errors`
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setBulkResult(null)}
            style={{ marginLeft: 'auto' }}
          >×</button>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineCube size={22} /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><HiOutlineEye size={22} /></div>
          <div className="stat-info">
            <h3>Total Scans</h3>
            <div className="stat-value">{stats.scans}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><HiOutlineExclamationTriangle size={22} /></div>
          <div className="stat-info">
            <h3>Expired</h3>
            <div className="stat-value">{stats.expired}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><HiOutlineCube size={22} /></div>
          <div className="stat-info">
            <h3>Categories</h3>
            <div className="stat-value">{stats.categories}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <HiOutlineMagnifyingGlass className="search-icon" />
        <input
          type="text"
          className="form-input"
          placeholder="Search products by name, brand, code, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-products"
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Products Table */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Products Found</h3>
          <p>Add your first product to get started.</p>
          <Link to="/products/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
            <HiOutlinePlusCircle size={16} /> Add Product
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Category</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Scans</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const expired = isExpired(product.expiry_date);
                const daysLeft = Math.ceil(
                  (new Date(product.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
                );
                const expiringSoon = !expired && daysLeft <= 30;

                return (
                  <tr key={product._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.brand}</div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: 'var(--accent-400)' }}>{product.code}</code>
                    </td>
                    <td><span className="badge badge-primary">{product.category}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {format(new Date(product.expiry_date), 'MMM dd, yyyy')}
                    </td>
                    <td>
                      {expired ? (
                        <span className="badge badge-danger">Expired</span>
                      ) : expiringSoon ? (
                        <span className="badge badge-warning">{daysLeft}d left</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {product.scanCount || 0}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Show QR Code"
                          onClick={() => showQrCode(product)}
                        >
                          <HiOutlineQrCode size={16} />
                        </button>
                        <Link
                          to={`/products/edit/${product._id}`}
                          className="btn btn-ghost btn-icon"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare size={16} />
                        </Link>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Delete"
                          onClick={() => setDeleteModal(product)}
                          style={{ color: 'var(--danger-400)' }}
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px' }}>Delete Product</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteModal._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => { setQrModal(null); setQrDataUrl(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px' }}>{qrModal.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Code: {qrModal.code}</p>
            {qrDataUrl && (
              <div style={{
                display: 'inline-block',
                padding: '16px',
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px'
              }}>
                <img src={qrDataUrl} alt={`QR Code for ${qrModal.name}`} style={{ width: '250px', height: '250px' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => downloadQr(qrModal.name)}>
                <HiOutlineArrowDownTray size={16} /> Download PNG
              </button>
              <button className="btn btn-secondary" onClick={() => { setQrModal(null); setQrDataUrl(''); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
