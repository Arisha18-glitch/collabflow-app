import Sidebar from './workspace/Sidebar';

export default function AppLayout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a12' }}>
            <Sidebar />
            <div className="main-content">
                {children}
            </div>
        </div>
    );
}