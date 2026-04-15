import { useState, useRef, useCallback } from 'react';
import QrScanner from '../components/Scanner/QrScanner';
import ProductCard from '../components/Product/ProductCard';
import VoiceControls from '../components/Voice/VoiceControls';
import API from '../api/axios';
import { cacheProduct, addToHistory, getCachedProduct } from '../utils/offlineCache';
import {
  IoQrCodeOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoKeypadOutline
} from 'react-icons/io5';


const ScannerPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [lastCode, setLastCode] = useState('');
  const inputRef = useRef(null);

  const fetchProduct = useCallback(async (code) => {
    if (!code || code === lastCode) return;
    setLastCode(code);
    setLoading(true);
    setError('');
    setProduct(null);

    try {
      const { data } = await API.get(`/products/scan/${encodeURIComponent(code)}`);
      if (data.success) {
        setProduct(data.data);
        cacheProduct(data.data);
        addToHistory(data.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Try offline cache
        const cached = getCachedProduct(code);
        if (cached) {
          setProduct(cached);
          setError('Showing cached version (offline)');
        } else {
          setError(`Product not found: "${code}" is not registered in our system.`);
        }
      } else {
        // Network error - try cache
        const cached = getCachedProduct(code);
        if (cached) {
          setProduct(cached);
          setError('Offline mode - showing cached data');
        } else {
          setError('Network error. Please check your connection.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [lastCode]);

  const handleScanSuccess = useCallback((decodedText) => {
    const code = decodedText.trim();
    if (code) {
      fetchProduct(code);
    }
  }, [fetchProduct]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      setLastCode(''); // Reset to allow re-scanning
      fetchProduct(manualCode.trim());
    }
  };

  const handleReset = () => {
    setProduct(null);
    setError('');
    setLastCode('');
    setManualCode('');
  };

  // Handle keyboard scanner input (external barcode scanner)
  const handleKeyboardInput = useCallback((e) => {
    if (scanMode === 'manual' && e.key === 'Enter' && manualCode.trim()) {
      e.preventDefault();
      setLastCode('');
      fetchProduct(manualCode.trim());
    }
  }, [scanMode, manualCode, fetchProduct]);

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>
          <IoQrCodeOutline
            style={{ verticalAlign: 'middle', marginRight: '10px' }}
            size={28}
          />
          Product Scanner
        </h1>
        <div className="page-actions">
          <button
            className={`btn ${scanMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setScanMode('camera')}
          >
            <IoQrCodeOutline size={16} /> Camera
          </button>
          <button
            className={`btn ${scanMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setScanMode('manual'); setTimeout(() => inputRef.current?.focus(), 100); }}
          >
            <IoKeypadOutline size={16} /> Manual / Scanner
          </button>
          {product && (
            <button className="btn btn-secondary" onClick={handleReset}>
              <IoRefreshOutline size={16} /> New Scan
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: product ? '1fr 1fr' : '1fr',
        gap: '24px',
        maxWidth: product ? '1200px' : '550px',
        margin: '0 auto',
        transition: 'all var(--transition-slow)'
      }}>
        {/* Scanner Section */}
        <div>
          {scanMode === 'camera' ? (
            <div className="scanner-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
              <div style={{
                marginBottom: '16px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                Point your camera at a QR code or barcode
              </div>
              <QrScanner
                onScanSuccess={handleScanSuccess}
                onScanError={() => {}}
              />
            </div>
          ) : (
            <div className="scanner-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '2rem'
                }}>
                  <IoKeypadOutline size={36} style={{ color: 'var(--primary-400)' }} />
                </div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Manual Entry / External Scanner</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Type a product code or use an external barcode scanner (USB/Bluetooth)
                </p>

                <form onSubmit={handleManualSubmit} className="manual-input-row">
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-input"
                    placeholder="Enter product code (e.g., BOOST-001)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={handleKeyboardInput}
                    autoFocus
                    id="manual-code-input"
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading || !manualCode.trim()}>
                    <IoSearchOutline size={16} />
                    Lookup
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-overlay" style={{ padding: '30px' }}>
              <div className="spinner" />
              <p>Looking up product...</p>
            </div>
          )}

          {/* Error */}
          {error && !product && (
            <div className="alert alert-danger" style={{ marginTop: '16px' }}>
              {error}
            </div>
          )}
          {error && product && (
            <div className="alert alert-warning" style={{ marginTop: '16px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Product Result */}
        {product && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <ProductCard product={product} />
            <VoiceControls product={product} autoPlay={true} />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .page-container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ScannerPage;
