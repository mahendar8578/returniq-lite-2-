import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, RotateCcw, Package } from 'lucide-react';
import { returnsApi, productsApi, getErrorMessage } from '../services/api';

const ALLOWED_REASONS = [
  'Damaged',
  'Wrong Product',
  'Size/Fit',
  'Quality Issue',
  'Customer Changed Mind',
  'Late Delivery',
  'Other'
];

export default function AddReturn() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    reason: 'Damaged',
    quantity: 1,
    notes: '',
    returnDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await productsApi.getAll();
        if (res.data && res.data.success) {
          setProducts(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              productId: res.data.data[0]._id
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load products for return form:', err);
        setError('Unable to load product list. Please verify the backend is running.');
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectedProduct = products.find(p => p._id === formData.productId);
  const remainingReturnable = selectedProduct 
    ? Math.max(0, selectedProduct.totalSold - selectedProduct.totalReturned) 
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const qty = Number(formData.quantity);

    if (!formData.productId) {
      setError('Please select a product.');
      return;
    }
    if (!formData.reason) {
      setError('Please choose a valid return reason.');
      return;
    }
    if (isNaN(qty) || qty < 1) {
      setError('Return quantity must be at least 1.');
      return;
    }

    if (selectedProduct && qty > remainingReturnable) {
      setError(`Return quantity (${qty}) exceeds maximum returnable units (${remainingReturnable}). Cannot return more than units sold.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await returnsApi.create({
        productId: formData.productId,
        reason: formData.reason,
        quantity: qty,
        notes: formData.notes.trim(),
        returnDate: formData.returnDate
      });

      if (res.data && res.data.success) {
        setSuccess('Return recorded successfully! Product metrics updated. Redirecting...');
        setTimeout(() => {
          navigate('/returns');
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create return:', err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading available products...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/returns" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={14} /> Back to Returns
        </Link>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Record Product Return</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Log customer returns with categorized failure reasons to detect defect patterns.
        </p>
      </div>

      {success && (
        <div className="alert-box success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-box error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="card empty-state">
          <Package size={40} className="empty-state-icon" />
          <div className="empty-state-text">No Products in Inventory</div>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            You must add at least one product before recording customer returns.
          </p>
          <Link to="/products/add" className="btn btn-primary btn-sm">
            Add Product First
          </Link>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Product *</label>
              <select
                name="productId"
                className="form-select"
                value={formData.productId}
                onChange={handleChange}
                required
              >
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.productName} ({p.productCode}) — Sold: {p.totalSold}, Returned: {p.totalReturned}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Category / Supplier:</span>
                  <strong>{selectedProduct.category} • {selectedProduct.supplier}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Units Sold vs Returned:</span>
                  <span>{selectedProduct.totalSold} sold / {selectedProduct.totalReturned} returned</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Maximum Returnable Quantity:</span>
                  <strong style={{ color: remainingReturnable > 0 ? 'var(--healthy-green)' : 'var(--alert-red)' }}>
                    {remainingReturnable} unit{remainingReturnable === 1 ? '' : 's'}
                  </strong>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Return Reason *</label>
                <select
                  name="reason"
                  className="form-select"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                >
                  {ALLOWED_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Return Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-input"
                  min="1"
                  max={remainingReturnable || 999999}
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Return Date *</label>
              <input
                type="date"
                name="returnDate"
                className="form-input"
                value={formData.returnDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer / Inspector Notes (Optional)</label>
              <textarea
                name="notes"
                className="form-textarea"
                rows="3"
                placeholder="e.g. Zipper jammed upon arrival; customer requested replacement."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <Link to="/returns" className="btn btn-secondary">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting || remainingReturnable <= 0}
              >
                <RotateCcw size={16} />
                <span>{submitting ? 'Recording...' : 'Record Return'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

