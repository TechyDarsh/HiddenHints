import { useState } from 'react';
import { getScanHistory, clearCache } from '../utils/offlineCache';
import { format } from 'date-fns';
import { HiOutlineClock, HiOutlineTrash, HiOutlineQrCode } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
  const [history, setHistory] = useState(getScanHistory());
  const navigate = useNavigate();

  const handleClear = () => {
    if (window.confirm('Clear all scan history?')) {
      clearCache();
      setHistory([]);
    }
  };

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>
          <HiOutlineClock style={{ verticalAlign: 'middle', marginRight: '10px' }} size={28} />
          Scan History
        </h1>
        <div className="page-actions">
          {history.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleClear}>
              <HiOutlineTrash size={14} /> Clear History
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🕐</div>
          <h3>No Scan History</h3>
          <p>Scanned products will appear here for quick reference.</p>
          <button className="btn btn-primary" onClick={() => navigate('/scanner')} style={{ marginTop: '16px' }}>
            <HiOutlineQrCode size={16} /> Go to Scanner
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px', maxWidth: '700px' }}>
          {history.map((item, index) => (
            <div
              key={index}
              className="glass-card"
              style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                animation: `fadeInUp ${0.1 + index * 0.05}s ease`
              }}
              onClick={() => navigate(`/scanner`)}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-400)',
                flexShrink: 0
              }}>
                <HiOutlineQrCode size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>{item.brand}</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                <div>{format(new Date(item.scannedAt), 'MMM dd, yyyy')}</div>
                <div>{format(new Date(item.scannedAt), 'hh:mm a')}</div>
              </div>

              <code style={{ fontSize: '0.75rem', color: 'var(--accent-400)', flexShrink: 0 }}>
                {item.code}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
