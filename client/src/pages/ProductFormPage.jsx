import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import {
  HiOutlineCheck,
  HiOutlineArrowLeft,
  HiOutlineQrCode
} from 'react-icons/hi2';
import QRCode from 'qrcode';

const CATEGORIES = [
  'Food', 'Beverages', 'Healthcare', 'Personal Care', 'Dairy',
  'Snacks', 'Electronics', 'Household', 'Baby Products', 'Other'
];

const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: '',
    name: '',
    brand: '',
    ingredients: '',
    mfg_date: '',
    expiry_date: '',
    allergens: '',
    nutrition: '',
    usage: '',
    warnings: '',
    category: 'Food'
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [qrPreview, setQrPreview] = useState('');

  // Fetch product for edit
  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const { data } = await API.get(`/products/${id}`);
          if (data.success) {
            const p = data.data;
            setForm({
              code: p.code || '',
              name: p.name || '',
              brand: p.brand || '',
              ingredients: p.ingredients || '',
              mfg_date: p.mfg_date ? p.mfg_date.substring(0, 10) : '',
              expiry_date: p.expiry_date ? p.expiry_date.substring(0, 10) : '',
              allergens: p.allergens || '',
              nutrition: p.nutrition || '',
              usage: p.usage || '',
              warnings: p.warnings || '',
              category: p.category || 'Food'
            });
          }
        } catch {
          setError('Failed to load product');
        } finally {
          setFetchLoading(false);
        }
      })();
    }
  }, [id, isEdit]);

  // Generate QR preview when code changes
  useEffect(() => {
    if (form.code) {
      QRCode.toDataURL(form.code, {
        width: 150,
        margin: 1,
        color: { dark: '#1a1a3e', light: '#ffffff' }
      }).then(setQrPreview).catch(() => setQrPreview(''));
    } else {
      setQrPreview('');
    }
  }, [form.code]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await API.put(`/products/${id}`, form);
      } else {
        await API.post('/products', form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-container loading-overlay">
        <div className="spinner" />
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft size={20} />
          </button>
          <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>
        {/* Form */}
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="product-code">Product Code *</label>
                <input
                  id="product-code"
                  name="code"
                  type="text"
                  className="form-input"
                  placeholder="e.g., BOOST-001"
                  value={form.code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="product-name">Product Name *</label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Boost Health Drink"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="product-brand">Brand *</label>
                <input
                  id="product-brand"
                  name="brand"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Boost"
                  value={form.brand}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="product-category">Category *</label>
                <select
                  id="product-category"
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-ingredients">Ingredients</label>
              <textarea
                id="product-ingredients"
                name="ingredients"
                className="form-textarea"
                placeholder="List of ingredients..."
                value={form.ingredients}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="product-mfg">Manufacturing Date *</label>
                <input
                  id="product-mfg"
                  name="mfg_date"
                  type="date"
                  className="form-input"
                  value={form.mfg_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="product-expiry">Expiry Date *</label>
                <input
                  id="product-expiry"
                  name="expiry_date"
                  type="date"
                  className="form-input"
                  value={form.expiry_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-allergens">Allergens</label>
              <input
                id="product-allergens"
                name="allergens"
                type="text"
                className="form-input"
                placeholder="e.g., Milk, Gluten, Soy"
                value={form.allergens}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-nutrition">Nutritional Info</label>
              <textarea
                id="product-nutrition"
                name="nutrition"
                className="form-textarea"
                placeholder="Energy, protein, carbs, fat per 100g..."
                value={form.nutrition}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-usage">Usage Instructions</label>
              <textarea
                id="product-usage"
                name="usage"
                className="form-textarea"
                placeholder="How to use this product..."
                value={form.usage}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-warnings">Safety Warnings</label>
              <textarea
                id="product-warnings"
                name="warnings"
                className="form-textarea"
                placeholder="Safety precautions and warnings..."
                value={form.warnings}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiOutlineCheck size={18} />
                    {isEdit ? 'Update Product' : 'Save Product'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* QR Preview Sidebar */}
        <div className="glass-card" style={{ textAlign: 'center', position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            justifyContent: 'center', marginBottom: '16px',
            color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600'
          }}>
            <HiOutlineQrCode size={18} />
            QR Code Preview
          </div>

          {qrPreview ? (
            <div style={{
              display: 'inline-block',
              padding: '12px',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              marginBottom: '12px'
            }}>
              <img src={qrPreview} alt="QR Preview" style={{ width: '140px', height: '140px' }} />
            </div>
          ) : (
            <div style={{
              padding: '40px 20px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem'
            }}>
              Enter a product code<br />to see QR preview
            </div>
          )}

          {form.code && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--accent-400)',
              fontFamily: 'monospace',
              fontWeight: '600'
            }}>
              {form.code}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .page-container > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductFormPage;
