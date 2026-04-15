import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineExclamationTriangle,
  HiOutlineClock
} from 'react-icons/hi2';
import { format } from 'date-fns';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/analytics/overview');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page-container loading-overlay">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>
          <HiOutlineChartBar style={{ verticalAlign: 'middle', marginRight: '10px' }} size={28} />
          Analytics Dashboard
        </h1>
      </div>

      {/* Overview Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineCube size={22} /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <div className="stat-value">{data?.totalProducts || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><HiOutlineEye size={22} /></div>
          <div className="stat-info">
            <h3>Total Scans</h3>
            <div className="stat-value">{data?.totalScans || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><HiOutlineExclamationTriangle size={22} /></div>
          <div className="stat-info">
            <h3>Expired</h3>
            <div className="stat-value">{data?.expiredProducts || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><HiOutlineClock size={22} /></div>
          <div className="stat-info">
            <h3>Expiring Soon</h3>
            <div className="stat-value">{data?.expiringSoon || 0}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Most Scanned */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>
            <HiOutlineEye style={{ verticalAlign: 'middle', marginRight: '8px' }} size={18} />
            Most Scanned Products
          </h3>
          {data?.mostScanned?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.mostScanned.map((product, i) => (
                <div key={product._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.05)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: i < 3
                      ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                      : 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {product.brand} · {product.category}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: 'var(--primary-300)'
                  }}>
                    {product.scanCount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>No scans recorded yet</p>
            </div>
          )}
        </div>

        {/* Recently Scanned */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>
            <HiOutlineClock style={{ verticalAlign: 'middle', marginRight: '8px' }} size={18} />
            Recently Scanned
          </h3>
          {data?.recentlyScanned?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recentlyScanned.map((product) => (
                <div key={product._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.05)'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {product.brand}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {product.lastScannedAt
                      ? format(new Date(product.lastScannedAt), 'MMM dd, hh:mm a')
                      : 'N/A'
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>No recent scans</p>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>
            <HiOutlineCube style={{ verticalAlign: 'middle', marginRight: '8px' }} size={18} />
            Products by Category
          </h3>
          {data?.categories?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {data.categories.map(cat => {
                const maxCount = Math.max(...data.categories.map(c => c.count));
                const width = Math.max(15, (cat.count / maxCount) * 100);
                return (
                  <div key={cat._id} style={{
                    flex: '1 1 calc(50% - 5px)',
                    minWidth: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ width: '100px', fontWeight: '500', fontSize: '0.85rem', flexShrink: 0 }}>
                      {cat._id || 'Uncategorized'}
                    </div>
                    <div style={{
                      flex: 1,
                      height: '24px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${width}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: 'white',
                        transition: 'width 0.8s ease',
                        minWidth: '30px'
                      }}>
                        {cat.count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>No categories found</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .page-container > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
          .page-container > div:nth-child(3) > *:last-child {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;
