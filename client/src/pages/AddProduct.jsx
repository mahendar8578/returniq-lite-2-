import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, CheckCircle2, AlertTriangle, PlusCircle } from 'lucide-react';
import { productsApi, getErrorMessage } from '../services/api';

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home',
  'Accessories',
  'Kitchen',
  'Footwear',
  'Beauty',
  'Sports'
];

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    category: 'Electronics',
    customCategory: '',
    supplier: '',
    totalSold: 0,
    totalReturned: 0
  });

  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend validations
    const name = formData.productName.trim();
    const code = formData.productCode.trim().toUpperCase();
    const cat = useCustomCategory ? formData.customCategory.trim() : formData.category;
    const sup = formData.supplier.trim();
    const sold = Number(formData.totalSold);
    const returned = Number(formData.totalReturned);

    if (!name) {
      setError('Product name is required.');
      return;
    }
    if (!code) {
      setError('Product code is required.');
      return;
    }
    if (!cat) {
      setError('Category is required.');
      return;
    }
    if (!sup) {
      setError('Supplier name is required.');
      return;
    }
    if (isNaN(sold) || sold < 0) {
      setError('Total sold units cannot be negative.');
      return;
    }
    if (isNaN(returned) || returned < 0) {
      setError('Total returned units cannot be negative.');
      return;
    }
    if (returned > sold) {
      setError('Total returned units cannot exceed total sold units.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        productName: name,
        productCode: code,
        category: cat,
        supplier: sup,
        totalSold: sold,
        totalReturned: returned
      };

      const res = await productsApi.create(payload);

      if (res.data && res.data.success) {
        setSuccess('Product registered successfully! Redirecting to inventory...');
        setTimeout(() => {
          navigate('/products');
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create product:', err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Navigation Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Add New Product</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Create an inventory item and track its sales and returns.
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

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="productName"
              className="form-input"
              placeholder="e.g. Ergonomic Office Chair"
              value={formData.productName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Code (SKU) *</label>
              <input
                type="text"
                name="productCode"
                className="form-input"
                placeholder="e.g. EOC-101"
                value={formData.productCode}
                onChange={handleChange}
                style={{ textTransform: 'uppercase' }}
                required
              />
              <div className="form-hint">Must be unique across all products.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <input
                type="text"
                name="supplier"
                className="form-input"
                placeholder="e.g. Apex Furniture Co."
                value={formData.supplier}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Category *</label>
              <button
                type="button"
                onClick={() => setUseCustomCategory(!useCustomCategory)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {useCustomCategory ? 'Choose from list' : '+ Add custom category'}
              </button>
            </div>

            {useCustomCategory ? (
              <input
                type="text"
                name="customCategory"
                className="form-input"
                placeholder="Enter custom category name..."
                value={formData.customCategory}
                onChange={handleChange}
                required
              />
            ) : (
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Initial Units Sold *</label>
              <input
                type="number"
                name="totalSold"
                className="form-input"
                min="0"
                value={formData.totalSold}
                onChange={handleChange}
                required
              />
              <div className="form-hint">Total volume distributed so far.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Units Returned</label>
              <input
                type="number"
                name="totalReturned"
                className="form-input"
                min="0"
                value={formData.totalReturned}
                onChange={handleChange}
              />
              <div className="form-hint">Must not exceed units sold.</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <PlusCircle size={16} />
              <span>{submitting ? 'Registering...' : 'Register Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

