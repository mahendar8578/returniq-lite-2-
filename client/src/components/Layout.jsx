import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  RotateCcw, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Activity,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { healthApi } from '../services/api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check backend health periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await healthApi.check();
        setBackendOnline(res.data && res.data.success);
      } catch (err) {
        setBackendOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close sidebar on mobile navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/returns', label: 'Returns', icon: RotateCcw },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard Overview';
    if (location.pathname === '/products') return 'Product Inventory';
    if (location.pathname === '/products/add') return 'Add New Product';
    if (location.pathname.startsWith('/products/edit/')) return 'Edit Product';
    if (location.pathname === '/returns') return 'Return Management';
    if (location.pathname === '/returns/add') return 'Record Return';
    if (location.pathname === '/analytics') return 'Return Trends & Analytics';
    if (location.pathname === '/settings') return 'Configuration & Thresholds';
    return 'ReturnIQ Lite';
  };

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 35 }} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-badge">
            <RotateCcw size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>ReturnIQ Lite</h1>
            <p>Return Intelligence</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="project-meta">
            <span className="label">CIA-II College Project</span>
            <span className="owner">Mahendar M (2102508597)</span>
            <div style={{ marginTop: '0.35rem', color: '#94a3b8', fontSize: '0.7rem' }}>
              Sem 3 Backend Development
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        <header className="top-header">
          <div className="header-title">
            <button 
              className="mobile-toggle" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{getPageTitle()}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Quick Actions */}
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/returns/add')}
            >
              <PlusCircle size={15} />
              <span>Record Return</span>
            </button>

            {/* Backend Connectivity Status */}
            <div className="header-status">
              <span className={`status-dot ${backendOnline === false ? 'offline' : ''}`} />
              <span>{backendOnline === true ? 'API Connected' : backendOnline === false ? 'API Offline' : 'Connecting...'}</span>
            </div>
          </div>
        </header>

        {/* Global Offline Banner if backend fails */}
        {backendOnline === false && (
          <div style={{ margin: '1rem 2rem 0 2rem' }}>
            <div className="alert-box error">
              <AlertTriangle size={18} />
              <div>
                <strong>Backend Unavailable:</strong> Unable to connect to the ReturnIQ Lite server at <code>http://localhost:5000/api</code>. Please ensure the backend is running (<code>cd server && npm run dev</code>).
              </div>
            </div>
          </div>
        )}

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

