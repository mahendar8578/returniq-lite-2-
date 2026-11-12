import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  AlertTriangle, 
  PieChart, 
  TrendingDown, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  PlusCircle,
  RotateCcw,
  Sliders,
  Filter
} from 'lucide-react';
import { analyticsApi, getErrorMessage } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsApi.getSummary();
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics summary:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Aggregating MongoDB return intelligence and trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-box error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          <strong>Error Loading Analytics</strong>
        </div>
        <p>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const threshold = data?.threshold ?? 10;
  const returnsByReason = data?.returnsByReason ?? [];
  const returnRateByProduct = data?.returnRateByProduct ?? [];
  const topReturnedProducts = data?.topReturnedProducts ?? [];
  const productsAboveThreshold = data?.productsAboveThreshold ?? [];
  const categorySummary = data?.categorySummary ?? [];
  const totalReturnedUnits = data?.totalReturnedUnits ?? 0;

  // Maximum scales for proportional bar rendering
  const maxRate = Math.max(...returnRateByProduct.map(p => p.returnRate || 0), threshold * 1.5, 20);
  const maxUnits = Math.max(...topReturnedProducts.map(p => p.totalReturned || 0), 10);
  const maxReasonUnits = Math.max(...returnsByReason.map(r => r.units || 0), 5);

  const hasData = data && data.totalProducts > 0;

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Return Trends & Reason Analysis</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Root-cause analytics aggregated directly from MongoDB records. Alert Threshold: <strong style={{ color: 'var(--primary)' }}>{threshold}%</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics}>
            <RefreshCw size={14} /> Refresh Analytics
          </button>
          <Link to="/settings" className="btn btn-secondary btn-sm">
            <Sliders size={14} /> Adjust Threshold
          </Link>
          <Link to="/returns/add" className="btn btn-primary btn-sm">
            <PlusCircle size={14} /> Log Return
          </Link>
        </div>
      </div>

      {!hasData ? (
        <div className="card empty-state">
          <BarChart3 size={44} className="empty-state-icon" />
          <div className="empty-state-text" style={{ fontSize: '1.1rem' }}>No Analytics Data Available</div>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Products and returns must be recorded in MongoDB to generate empirical charts and reason distributions.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/products/add" className="btn btn-secondary btn-sm">
              Add Products First
            </Link>
            <Link to="/returns/add" className="btn btn-primary btn-sm">
              Record Customer Return
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Top 2 Primary Charts Row */}
          <div className="grid-2">
            {/* CHART 1: Returns by Reason Category */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <PieChart size={18} color="var(--primary)" />
                    <span>Chart 1: Returns by Reason</span>
                  </div>
                  <div className="card-subtitle">
                    Distribution across 7 standard defect/customer reasons ({totalReturnedUnits} total units)
                  </div>
                </div>
              </div>

              {totalReturnedUnits === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <RotateCcw size={32} className="empty-state-icon" />
                  <p>No customer returns recorded yet to distribute by reason.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {returnsByReason.map((item) => {
                    const barWidth = maxReasonUnits > 0 
                      ? Math.round((item.units / maxReasonUnits) * 100) 
                      : 0;

                    return (
                      <div key={item.reason} className="metric-bar-item">
                        <div className="metric-bar-label">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <strong>{item.reason}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              ({item.units} unit{item.units === 1 ? '' : 's'} • {item.count} log{item.count === 1 ? '' : 's'})
                            </span>
                          </span>
                          <span style={{ fontWeight: 700, color: item.units > 0 ? 'var(--primary)' : 'var(--text-dim)' }}>
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="metric-bar-bg" style={{ height: '12px' }}>
                          <div 
                            className="metric-bar-fill primary" 
                            style={{ width: `${barWidth}%`, minWidth: item.units > 0 ? '6px' : '0' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CHART 2: Return Rate by Product (with Alert Threshold Line) */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <TrendingDown size={18} color="var(--alert-red)" />
                    <span>Chart 2: Return Rate by Product</span>
                  </div>
                  <div className="card-subtitle">
                    Calculated percentage with benchmark indicator at {threshold}% threshold
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {returnRateByProduct.slice(0, 6).map((p) => {
                  const isAlert = p.status === 'ALERT';
                  const barWidth = Math.min(100, Math.round((p.returnRate / maxRate) * 100));

                  return (
                    <div key={p._id} className="metric-bar-item">
                      <div className="metric-bar-label">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong>{p.productName}</strong>
                          <code style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{p.productCode}</code>
                        </span>
                        <span style={{ fontWeight: 700, color: isAlert ? 'var(--alert-red)' : 'var(--healthy-green)' }}>
                          {p.returnRate}% {isAlert ? '(ALERT)' : '(HEALTHY)'}
                        </span>
                      </div>
                      <div className="metric-bar-bg" style={{ height: '12px', position: 'relative' }}>
                        <div 
                          className={`metric-bar-fill ${isAlert ? 'alert' : 'healthy'}`}
                          style={{ width: `${barWidth}%`, minWidth: p.returnRate > 0 ? '6px' : '0' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        <span>Category: {p.category} | Supplier: {p.supplier}</span>
                        <span>{p.totalReturned} ret / {p.totalSold} sold</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section B & Category Summary */}
          <div className="grid-2">
            {/* Section B: Highest Return Quantity Products */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Layers size={18} color="var(--warning-amber)" />
                    <span>Highest Return Quantity (Volume)</span>
                  </div>
                  <div className="card-subtitle">
                    Products ranked by raw number of returned units
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {topReturnedProducts.slice(0, 5).map((p) => {
                  const barWidth = maxUnits > 0 
                    ? Math.min(100, Math.round((p.totalReturned / maxUnits) * 100))
                    : 0;

                  return (
                    <div key={p._id} className="metric-bar-item">
                      <div className="metric-bar-label">
                        <span><strong>{p.productName}</strong> ({p.category})</span>
                        <span style={{ fontWeight: 700 }}>{p.totalReturned} units returned</span>
                      </div>
                      <div className="metric-bar-bg" style={{ height: '10px' }}>
                        <div 
                          className="metric-bar-fill"
                          style={{ width: `${barWidth}%`, backgroundColor: 'var(--warning-amber)', minWidth: p.totalReturned > 0 ? '6px' : '0' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Level Return Metrics */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <BarChart3 size={18} color="var(--info-blue)" />
                    <span>Returns Across Product Categories</span>
                  </div>
                  <div className="card-subtitle">
                    Department return volume and calculated category rates
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {categorySummary.map((cat) => (
                  <div key={cat.category} className="metric-bar-item">
                    <div className="metric-bar-label">
                      <span><strong>{cat.category}</strong> ({cat.productCount} SKU{cat.productCount === 1 ? '' : 's'})</span>
                      <span style={{ fontWeight: 700, color: cat.returnRate >= threshold ? 'var(--alert-red)' : 'var(--text-main)' }}>
                        {cat.returnRate}% ({cat.returned} / {cat.sold} units)
                      </span>
                    </div>
                    <div className="metric-bar-bg" style={{ height: '10px' }}>
                      <div 
                        className="metric-bar-fill"
                        style={{ 
                          width: `${Math.min(100, cat.returnRate * 2.5)}%`, 
                          backgroundColor: cat.returnRate >= threshold ? 'var(--alert-red)' : 'var(--info-blue)',
                          minWidth: cat.returned > 0 ? '6px' : '0'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section D: Products Above Threshold (ALERT) */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <AlertTriangle size={18} color="var(--alert-red)" />
                  <span>Products Above Alert Threshold ({threshold}%)</span>
                </div>
                <div className="card-subtitle">
                  Inventory items currently flagged as ALERT requiring vendor investigation
                </div>
              </div>

              <span className="badge badge-alert">
                {productsAboveThreshold.length} ALERT item{productsAboveThreshold.length === 1 ? '' : 's'}
              </span>
            </div>

            {productsAboveThreshold.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <CheckCircle2 size={38} color="var(--healthy-green)" className="empty-state-icon" />
                <div style={{ color: 'var(--healthy-green)', fontWeight: 600, fontSize: '1rem' }}>
                  No products are currently above the {threshold}% threshold.
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  All catalog items are classified as HEALTHY.
                </p>
              </div>
            ) : (
              <div className="table-responsive" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU Code</th>
                      <th>Category</th>
                      <th>Supplier</th>
                      <th style={{ textAlign: 'right' }}>Units Sold</th>
                      <th style={{ textAlign: 'right' }}>Returned</th>
                      <th style={{ textAlign: 'right' }}>Return Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsAboveThreshold.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.productName}</td>
                        <td><code>{p.productCode}</code></td>
                        <td><span className="badge badge-category">{p.category}</span></td>
                        <td>{p.supplier}</td>
                        <td style={{ textAlign: 'right' }}>{p.totalSold?.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', color: 'var(--alert-red)', fontWeight: 600 }}>
                          {p.totalReturned?.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--alert-red)' }}>
                          {p.returnRate}%
                        </td>
                        <td>
                          <span className="badge badge-alert">
                            <AlertTriangle size={12} /> ALERT
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
