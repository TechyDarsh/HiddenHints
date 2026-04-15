import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineCube,
  HiOutlinePlusCircle,
  HiOutlineQrCode,
  HiOutlineChartBar,
  HiOutlineArrowRightOnRectangle,
  HiOutlineClock,
  HiOutlineXMark
} from 'react-icons/hi2';

const navItems = [
  { to: '/dashboard', icon: HiOutlineSquares2X2, label: 'Dashboard', adminOnly: true },
  { to: '/products', icon: HiOutlineCube, label: 'Products', adminOnly: true },
  { to: '/products/new', icon: HiOutlinePlusCircle, label: 'Add Product', adminOnly: true },
  { to: '/scanner', icon: HiOutlineQrCode, label: 'Scanner', adminOnly: false },
  { to: '/history', icon: HiOutlineClock, label: 'Scan History', adminOnly: false },
  { to: '/analytics', icon: HiOutlineChartBar, label: 'Analytics', adminOnly: true },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            display: 'none'
          }}
        />
      )}

      <aside
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'var(--sidebar-width)',
          height: '100vh',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform var(--transition-base)',
          transform: isOpen ? 'translateX(0)' : undefined,
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.85rem',
              color: 'white',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
            }}>
              SP
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', lineHeight: 1.2 }}>SPIS</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Intelligence System
              </div>
            </div>
          </div>
          <button
            className="show-mobile btn-ghost btn-icon"
            onClick={onClose}
            style={{ border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '8px', padding: '0 8px', fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Menu
          </div>
          {filteredItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2px',
                fontWeight: '500',
                fontSize: '0.9rem',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))'
                  : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary-500)' : '3px solid transparent',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none'
              })}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-500), var(--primary-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.8rem',
              color: 'white',
              flexShrink: 0
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username || 'User'}
              </div>
              <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-accent'}`}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              color: 'var(--danger-400)',
              border: '1px solid rgba(244, 63, 94, 0.2)'
            }}
          >
            <HiOutlineArrowRightOnRectangle size={18} />
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
