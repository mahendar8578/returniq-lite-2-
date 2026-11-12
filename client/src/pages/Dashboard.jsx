import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  RotateCcw, 
  Percent, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  PlusCircle,
  Sliders,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { dashboardApi, productsApi, settingsApi, getErrorMessage } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, alertsRes, settingsRes] = await Promise.all([
        dashboardApi.getSummary(),
        productsApi.getAlerts(),
        settingsApi.get()
      ]);

      if (summaryRes.data && summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      if (alertsRes.data && alertsRes.data.success) {
        setAlerts(alertsRes.data.data);
      }
      if (settingsRes.data && settingsRes.data.success) {
        setThreshold(settingsRes.data.data.returnRateThreshold);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading dashboard intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-box error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          <strong>Error Loading Dashboard</strong>
        </div>
        <p>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const overallRate = summary?.averageReturnRate || 0;
  const isOverallAboveThreshold = overallRate >= threshold;
  const rateDelta = Math.abs(Math.round((overallRate - threshold) * 10) / 10);

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Return Intelligence Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live return rates, supplier risk alerts, and inventory health metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData} title="Refresh live data from MongoDB">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/products/add" className="btn btn-secondary btn-sm">
            <PlusCircle size={14} /> Add Product
          </Link>
          <Link to="/returns/add" className="btn btn-primary btn-sm">
            <RotateCcw size={14} /> Record Return
          </Link>
        </div>
      </div>

      {/* 5 KPI Summary Cards (All from real MongoDB API) */}
      <div className="grid-5">
        {/* 1. Total Products */}
        <div className="stat-card">
          <div className="stat-icon primary">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{summary?.totalProducts ?? 0}</div>
            <div className="stat-hint">Catalog items in DB</div>
          </div>
        </div>

        {/* 2. Total Units Sold */}
        <div className="stat-card">
          <div className="stat-icon info">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Units Sold</div>
            <div className="stat-value">{summary?.totalUnitsSold?.toLocaleString() ?? 0}</div>
            <div className="stat-hint">Total volume sold</div>
          </div>
        </div>

        {/* 3. Total Returns */}
        <div className="stat-card">
          <div className="stat-icon warning">
            <RotateCcw size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Returns</div>
            <div className="stat-value">{summary?.totalReturns?.toLocaleString() ?? 0}</div>
            <div className="stat-hint">Total units returned</div>
          </div>
        </div>

        {/* 4. Overall Return Rate */}
        <div className="stat-card">
          <div className="stat-icon success">
            <Percent size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Overall Return Rate</div>
            <div className="stat-value">{overallRate}%</div>
            <div className="stat-hint">(Returns / Sold) × 100</div>
          </div>
        </div>

        {/* 5. Products With Alerts */}
        <div 
          className="stat-card" 
          style={{ 
            borderColor: summary?.productsWithAlerts > 0 ? 'var(--alert-red-border)' : 'var(--healthy-green-border)',
            backgroundColor: summary?.productsWithAlerts > 0 ? 'var(--alert-red-bg)' : 'var(--bg-surface)' 
          }}
        >
          <div className={`stat-icon ${summary?.productsWithAlerts > 0 ? 'danger' : 'success'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Products With Alerts</div>
            <div 
              className="stat-value" 
              style={{ color: summary?.productsWithAlerts > 0 ? 'var(--alert-red)' : 'var(--healthy-green)' }}
            >
              {summary?.productsWithAlerts ?? 0}
            </div>
            <div className="stat-hint">Rate ≥ {threshold}% threshold</div>
          </div>
        </div>
      </div>

      {/* 3. RETURN RATE VISUAL COMPARISON CARD */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              {isOverallAboveThreshold ? (
                <ShieldAlert size={18} color="var(--alert-red)" />
              ) : (
                <ShieldCheck size={18} color="var(--healthy-green)" />
              )}
              <span>Overall Return Rate vs. Alert Threshold Benchmark</span>
            </div>
            <div className="card-subtitle">
              Visual benchmark comparing global catalog return rate against your configured threshold.
            </div>
          </div>

          <Link to="/settings" className="btn btn-secondary btn-sm">
            <Sliders size={14} /> Configure Threshold ({threshold}%)
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            {/* Visual metric bars */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>Overall Catalog Return Rate</span>
                <span style={{ color: isOverallAboveThreshold ? 'var(--alert-red)' : 'var(--healthy-green)', fontSize: '1.1rem' }}>
                  {overallRate}%
                </span>
              </div>
              <div className="metric-bar-bg" style={{ height: '14px' }}>
                <div 
                  className={`metric-bar-fill ${isOverallAboveThreshold ? 'alert' : 'healthy'}`}
                  style={{ width: `${Math.min(100, overallRate * 3)}%` }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>Configured Alert Threshold</span>
                <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                  {threshold}%
                </span>
              </div>
              <div className="metric-bar-bg" style={{ height: '14px' }}>
                <div 
                  className="metric-bar-fill primary"
                  style={{ width: `${Math.min(100, threshold * 3)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Diagnostic interpretation */}
          <div style={{ background: isOverallAboveThreshold ? 'var(--alert-red-bg)' : 'var(--healthy-green-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `1px solid ${isOverallAboveThreshold ? 'var(--alert-red-border)' : 'var(--healthy-green-border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {isOverallAboveThreshold ? (
                <>
                  <TrendingUp size={20} color="var(--alert-red)" />
                  <strong style={{ color: 'var(--alert-red-text)' }}>Threshold Exceeded by +{rateDelta}%</strong>
                </>
              ) : (
                <>
                  <TrendingDown size={20} color="var(--healthy-green)" />
                  <strong style={{ color: 'var(--healthy-green-text)' }}>Healthy Operations (-{rateDelta}% under threshold)</strong>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: isOverallAboveThreshold ? 'var(--alert-red-text)' : 'var(--healthy-green-text)', lineHeight: '1.5' }}>
              {isOverallAboveThreshold 
                ? `Overall catalog return rate (${overallRate}%) has breached the active alert threshold (${threshold}%). High-return products below require supplier inquiry or quality inspection.`
                : `Catalog return rate (${overallRate}%) is safely within the acceptable threshold limit (${threshold}%). Inventory and supplier returns are operating normally.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. ALERT SECTION: Products Requiring Attention */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <AlertTriangle size={18} color="var(--alert-red)" />
              <span>Products Requiring Attention</span>
            </div>
            <div className="card-subtitle">
              Active products whose return rate is greater than or equal to the {threshold}% threshold.
            </div>
          </div>

          <span className="badge badge-alert" style={{ fontSize: '0.8rem' }}>
            {alerts.length} product{alerts.length === 1 ? '' : 's'} flagged
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={44} color="var(--healthy-green)" className="empty-state-icon" />
            <div className="empty-state-text" style={{ color: 'var(--healthy-green)', fontSize: '1.05rem' }}>
              No products currently require attention.
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              All product return rates are strictly below the configured {threshold}% threshold.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: 'right' }}>Units Sold</th>
                  <th style={{ textAlign: 'right' }}>Returns</th>
                  <th style={{ textAlign: 'right' }}>Return Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{product.productName}</div>
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{product.productCode}</code>
                    </td>
                    <td>
                      <span className="badge badge-category">{product.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{product.supplier}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{product.totalSold?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--alert-red)', fontWeight: 600 }}>
                      {product.totalReturned?.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--alert-red)', fontSize: '0.98rem' }}>
                      {product.returnRate}%
                    </td>
                    <td>
                      <span className="badge badge-alert">
                        <AlertTriangle size={12} /> ALERT
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/products/edit/${product._id}`} className="btn btn-secondary btn-sm">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick Navigation</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/returns/add" className="btn btn-primary" style={{ justifyContent: 'space-between' }}>
              <span>Log Customer Return</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/products/add" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>Add New Product SKU</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/analytics" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
              <span>Explore Return Trend Analytics</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">CIA-II Core Architecture Flow</div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'monospace', background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
              <div>Add Products → Record Returns</div>
              <div>↓</div>
              <div>Store Data in MongoDB</div>
              <div>↓</div>
              <div>Calculate Return Rate: (Returned / Sold) × 100</div>
              <div>↓</div>
              <div>Compare with Configurable Threshold ({threshold}%)</div>
              <div>↓</div>
              <div>Flag High-Return Products (ALERT vs HEALTHY)</div>
            </div>
            <p>
              Managed by: <strong>Mahendar M (2102508597)</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
