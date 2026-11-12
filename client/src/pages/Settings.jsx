import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Info,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { settingsApi, getErrorMessage } from '../services/api';

export default function Settings() {
  const [threshold, setThreshold] = useState(10);
  const [inputThreshold, setInputThreshold] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsApi.get();
      if (res.data && res.data.success) {
        const val = res.data.data.returnRateThreshold;
        setThreshold(val);
        setInputThreshold(String(val));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const num = Number(inputThreshold);

    if (isNaN(num)) {
      setError('Threshold must be a valid number.');
      return;
    }
    if (num <= 0 || num > 100) {
      setError('Threshold must be strictly greater than 0 and less than or equal to 100.');
      return;
    }

    try {
      setSaving(true);
      const res = await settingsApi.update({ returnRateThreshold: num });
      if (res.data && res.data.success) {
        setThreshold(res.data.data.returnRateThreshold);
        setSuccess(`Alert threshold successfully saved to ${res.data.data.returnRateThreshold}% in MongoDB. All product statuses, dashboard cards, and analytics charts reflect this new threshold immediately.`);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>System Settings & Alert Configuration</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configure the core differentiating threshold that triggers real-time return rate warnings.
        </p>
      </div>

      {success && (
        <div className="alert-box success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Link to="/" className="btn btn-primary btn-sm">
              <LayoutDashboard size={14} /> Open Dashboard
            </Link>
            <Link to="/analytics" className="btn btn-secondary btn-sm">
              <BarChart3 size={14} /> Open Analytics
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-box error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Sliders size={18} color="var(--primary)" />
              <span>Return Rate Alert Threshold</span>
            </div>
            <div className="card-subtitle">
              Active configuration saved in MongoDB: <strong>{threshold}%</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Alert Trigger Percentage (%) *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '320px' }}>
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="100"
                className="form-input"
                value={inputThreshold}
                onChange={(e) => setInputThreshold(e.target.value)}
                required
              />
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>%</span>
            </div>
            <div className="form-hint">
              Products with Return Rate ≥ this value are flagged as <strong>ALERT</strong>. Products below are marked <strong>HEALTHY</strong>.
            </div>
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
            {[5, 10, 15, 20, 25].map(preset => (
              <button
                type="button"
                key={preset}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => setInputThreshold(String(preset))}
              >
                {preset}%
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Updating...' : 'Save Configuration'}</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={loadSettings} disabled={saving}>
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* College Project Demonstration Card */}
      <div className="card" style={{ background: '#f8fafc' }}>
        <div className="card-header">
          <div className="card-title">
            <Info size={18} color="var(--info-blue)" />
            <span>Academic Project Specification (CIA-II)</span>
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: '1.6' }}>
          <div>
            <strong>Problem Statement:</strong> Small retailers often process returns without recognizing recurrent product defects or supplier shortcomings. ReturnIQ Lite automates defect reason logging and anomaly detection.
          </div>
          <div>
            <strong>Differentiating Feature:</strong> Configurable Return Rate Threshold. Unlike static systems, updating the threshold here dynamically re-evaluates all catalog items across MongoDB without saving stale status flags in the product documents.
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Project Information
            </span>
            <div><strong>Student Name:</strong> Mahendar M</div>
            <div><strong>Project ID:</strong> 2102508597</div>
            <div><strong>Subject:</strong> Semester 3 Backend Development CIA-II</div>
            <div><strong>Theme:</strong> Product Return Reason Analysis for Small Retailers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
