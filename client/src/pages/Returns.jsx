import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCcw, 
  PlusCircle, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  X,
  RefreshCw 
} from 'lucide-react';
import { returnsApi, getErrorMessage } from '../services/api';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await returnsApi.getAll();
      if (res.data && res.data.success) {
        setReturns(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load returns:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionError(null);
      const res = await returnsApi.delete(deleteId);
      if (res.data && res.data.success) {
        setActionSuccess('Return record deleted and product return count automatically adjusted.');
        setDeleteId(null);
        loadReturns();
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const getReasonClass = (reason) => {
    switch (reason) {
      case 'Damaged': return 'damaged';
      case 'Wrong Product': return 'wrong';
      case 'Size/Fit': return 'size';
      case 'Quality Issue': return 'quality';
      case 'Customer Changed Mind': return 'mind';
      case 'Late Delivery': return 'late';
      default: return 'other';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading return records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-box error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          <strong>Error Loading Returns</strong>
        </div>
        <p>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={loadReturns}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Return Log & Audit Trail</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Detailed log of all recorded customer returns and failure reasons.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadReturns}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/returns/add" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Record Return
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert-box success">
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="alert-box error">
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {returns.length === 0 ? (
          <div className="empty-state">
            <RotateCcw size={40} className="empty-state-icon" />
            <div className="empty-state-text">No return records found</div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              No product returns have been recorded yet. Click "Record Return" to log a customer return.
            </p>
            <Link to="/returns/add" className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> Record First Return
            </Link>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th>Notes</th>
                  <th>Return Date</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((item) => {
                  const product = item.productId || {};
                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{product.productName || 'Unknown Product'}</div>
                        <code style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {product.productCode || 'N/A'}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-category">{product.category || 'General'}</span>
                      </td>
                      <td>
                        <span className={`badge badge-reason ${getReasonClass(item.reason)}`}>
                          {item.reason}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.quantity}
                      </td>
                      <td style={{ maxWidth: '240px', color: item.notes ? 'var(--text-main)' : 'var(--text-dim)', fontSize: '0.85rem' }}>
                        {item.notes || '—'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} />
                          {new Date(item.returnDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-icon delete"
                          title="Delete Return Record"
                          onClick={() => setDeleteId(item._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--alert-red)' }}>
                Delete Return Entry
              </h3>
              <button className="btn-icon" onClick={() => setDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Are you sure you want to remove this return log entry?
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              The related product's <code>totalReturned</code> count will automatically be decremented by this return quantity in MongoDB.
            </p>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                <Trash2 size={14} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

