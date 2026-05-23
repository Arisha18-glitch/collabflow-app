import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Folder, Users, BarChart3, Settings } from 'lucide-react';
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

    const displayName = user?.name ?? 'Arisha';
    const roleColor   = ROLE_COLORS[currentUserRole] ?? 'var(--pink)';

    return (
        <div className="sidebar">
            <div className="sidebar-logo">CollabFlow</div>

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
    );
}