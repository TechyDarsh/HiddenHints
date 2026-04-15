import { format } from 'date-fns';
import {
  HiOutlineBeaker,
  HiOutlineCalendar,
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineShieldCheck,
  HiOutlineTag,
  HiOutlineCube,
  HiOutlineClipboardDocumentList
} from 'react-icons/hi2';

// Known harmful ingredients (simplified list)
const HARMFUL_INGREDIENTS = [
  'msg', 'monosodium glutamate', 'aspartame', 'high fructose corn syrup',
  'sodium nitrite', 'sodium nitrate', 'bha', 'bht', 'potassium bromate',
  'artificial color', 'artificial flavour', 'trans fat', 'partially hydrogenated',
  'red 40', 'yellow 5', 'yellow 6', 'blue 1'
];

const ProductCard = ({ product }) => {
  if (!product) return null;

  const isExpired = new Date() > new Date(product.expiry_date);
  const daysUntilExpiry = Math.ceil(
    (new Date(product.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const expiringSoon = !isExpired && daysUntilExpiry <= 30;

  // Check for harmful ingredients
  const ingredientsList = (product.ingredients || '').toLowerCase();
  const foundHarmful = HARMFUL_INGREDIENTS.filter(h => ingredientsList.includes(h));

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const allergenTags = (product.allergens || '')
    .split(',')
    .map(a => a.trim())
    .filter(a => a && a.toLowerCase() !== 'none');

  return (
    <div className={`product-card ${isExpired ? 'expired' : ''}`}>
      {/* Expiry Warning Banner */}
      {isExpired && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          <HiOutlineExclamationTriangle size={20} />
          <div>
            <strong>⚠️ EXPIRED PRODUCT</strong>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              This product expired on {formatDate(product.expiry_date)}. Do not consume or use.
            </div>
          </div>
        </div>
      )}

      {expiringSoon && (
        <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
          <HiOutlineExclamationTriangle size={20} />
          <span>Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}!</span>
        </div>
      )}

      {/* Harmful Ingredients Alert */}
      {foundHarmful.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
          <HiOutlineExclamationTriangle size={20} />
          <div>
            <strong>⚠️ Potentially Harmful Ingredients</strong>
            <div style={{ fontSize: '0.8rem' }}>
              Contains: {foundHarmful.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="product-card-header">
        <div>
          <h2>{product.name}</h2>
          <div className="brand-label">by {product.brand}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{product.category}</span>
          {isExpired ? (
            <span className="badge badge-danger">EXPIRED</span>
          ) : expiringSoon ? (
            <span className="badge badge-warning">EXPIRING SOON</span>
          ) : (
            <span className="badge badge-success">SAFE</span>
          )}
        </div>
      </div>

      {/* Product Code */}
      <div className="product-detail-row">
        <div className="detail-icon"><HiOutlineTag /></div>
        <div className="detail-content">
          <div className="detail-label">Product Code</div>
          <div className="detail-value" style={{ fontFamily: 'monospace', fontWeight: '600' }}>{product.code}</div>
        </div>
      </div>

      {/* Ingredients */}
      {product.ingredients && (
        <div className="product-detail-row">
          <div className="detail-icon"><HiOutlineBeaker /></div>
          <div className="detail-content">
            <div className="detail-label">Ingredients</div>
            <div className="detail-value">{product.ingredients}</div>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="product-detail-row">
        <div className="detail-icon"><HiOutlineCalendar /></div>
        <div className="detail-content">
          <div className="detail-label">Manufacturing Date</div>
          <div className="detail-value">{formatDate(product.mfg_date)}</div>
        </div>
      </div>

      <div className="product-detail-row">
        <div className="detail-icon" style={{
          background: isExpired ? 'rgba(244, 63, 94, 0.15)' : undefined,
          color: isExpired ? 'var(--danger-400)' : undefined
        }}>
          <HiOutlineCalendarDays />
        </div>
        <div className="detail-content">
          <div className="detail-label">Expiry Date</div>
          <div className={`detail-value ${isExpired ? 'expiry-expired' : expiringSoon ? 'expiry-soon' : 'expiry-safe'}`}>
            {formatDate(product.expiry_date)}
            {isExpired && ' (EXPIRED)'}
            {expiringSoon && ` (${daysUntilExpiry} days left)`}
          </div>
        </div>
      </div>

      {/* Allergens */}
      {allergenTags.length > 0 && (
        <div className="product-detail-row">
          <div className="detail-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger-400)' }}>
            <HiOutlineExclamationTriangle />
          </div>
          <div className="detail-content">
            <div className="detail-label">Allergens</div>
            <div className="detail-value">
              {allergenTags.map((tag, i) => (
                <span key={i} className="allergen-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nutrition */}
      {product.nutrition && product.nutrition.toLowerCase() !== 'not applicable' && (
        <div className="product-detail-row">
          <div className="detail-icon"><HiOutlineInformationCircle /></div>
          <div className="detail-content">
            <div className="detail-label">Nutritional Info</div>
            <div className="detail-value">{product.nutrition}</div>
          </div>
        </div>
      )}

      {/* Usage */}
      {product.usage && (
        <div className="product-detail-row">
          <div className="detail-icon"><HiOutlineClipboardDocumentList /></div>
          <div className="detail-content">
            <div className="detail-label">Usage Instructions</div>
            <div className="detail-value">{product.usage}</div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {product.warnings && (
        <div className="product-detail-row">
          <div className="detail-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-400)' }}>
            <HiOutlineShieldCheck />
          </div>
          <div className="detail-content">
            <div className="detail-label">Safety Warnings</div>
            <div className="detail-value" style={{ color: 'var(--warning-400)' }}>{product.warnings}</div>
          </div>
        </div>
      )}

      {/* Scan count */}
      {product.scanCount > 0 && (
        <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          <HiOutlineCube style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          Scanned {product.scanCount} time{product.scanCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
