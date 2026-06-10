import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Folder, Users, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDocStore } from '../../store/useDocStore';

const NAV_ITEMS = [
    { to: '/',          icon: Home,      label: 'Dashboard'  },
    { to: '/documents', icon: Folder,    label: 'Documents'  },
    { to: '/workspace', icon: Users,     label: 'Workspace'  },
    { to: '/analytics', icon: BarChart3, label: 'Analytics'  },
    { to: '/settings',  icon: Settings,  label: 'Settings'   },
];

const ROLE_COLORS = {
    Owner:  'var(--pink)',
    Editor: 'var(--blue)',
    Viewer: 'var(--green)',
};

export default function Sidebar() {
    const location = useLocation();
    const navigate  = useNavigate();
    const user     = useAuthStore((s) => s.user);
    const currentUserRole = useDocStore((s) => s.currentUserRole);

    const [mobileOpen, setMobileOpen] = useState(false);

    const displayName = user?.name ?? 'Arisha';
    const roleColor   = ROLE_COLORS[currentUserRole] ?? 'var(--pink)';

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <>
            {/* Mobile top bar */}
            <div className="mobile-topbar">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <div className="sidebar-logo" style={{ marginBottom: 0, fontSize: '1.2rem' }}>CollabFlow</div>
                <div style={{ width: 36 }} /> {/* Spacer for centering */}
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
                <div className="sidebar-logo sidebar-logo-desktop">CollabFlow</div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                        const isActive = to === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(to);
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                className={`nav-link${isActive ? ' active' : ''}`}
                            >
                                <Icon size={18} />
                                {label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div
                    className="sidebar-user"
                    onClick={() => navigate('/settings')}
                    style={{ cursor: 'pointer' }}
                    title="Settings & Profile"
                >
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: roleColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.1rem', color: '#000',
                        flexShrink: 0,
                        boxShadow: `0 0 16px ${roleColor}55`,
                    }}>
                        {displayName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sidebar-user-name"
                             style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayName}
                        </div>
                        <div className="sidebar-user-role">{currentUserRole}</div>
                    </div>
                    <div className="status-dot" />
                </div>
            </div>
        </>
    );
}