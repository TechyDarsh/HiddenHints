import { HiOutlineBars3BottomLeft, HiOutlineBell } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      height: 'var(--header-height)',
      background: 'rgba(10, 10, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 50,
      transition: 'left var(--transition-base)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="show-mobile btn btn-ghost btn-icon"
          onClick={onToggleSidebar}
          style={{ border: 'none', cursor: 'pointer' }}
          aria-label="Toggle menu"
        >
          <HiOutlineBars3BottomLeft size={22} />
        </button>

        <div className="hide-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Welcome back, <span style={{ color: 'var(--primary-300)', fontWeight: '600' }}>{user?.username}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: 'var(--radius-md)',
          transition: 'background var(--transition-fast)'
        }}>
          <HiOutlineBell size={20} color="var(--text-secondary)" />
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--danger-500)',
            boxShadow: '0 0 6px rgba(244, 63, 94, 0.5)'
          }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          header {
            left: 0 !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
