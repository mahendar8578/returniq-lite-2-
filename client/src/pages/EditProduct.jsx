import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Save, RefreshCw } from 'lucide-react';
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

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    category: 'Electronics',
    supplier: '',
    totalSold: 0,
    totalReturned: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await productsApi.getById(id);
        if (res.data && res.data.success) {
          const p = res.data.data;
          setFormData({
            productName: p.productName || '',
            productCode: p.productCode || '',
            category: p.category || 'Electronics',
            supplier: p.supplier || '',
            totalSold: p.totalSold !== undefined ? p.totalSold : 0,
            totalReturned: p.totalReturned !== undefined ? p.totalReturned : 0
          });
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

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

    const name = formData.productName.trim();
    const code = formData.productCode.trim().toUpperCase();
    const cat = formData.category.trim();
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
      const res = await productsApi.update(id, {
        productName: name,
        productCode: code,
        category: cat,
        supplier: sup,
        totalSold: sold,
        totalReturned: returned
      });

      if (res.data && res.data.success) {
        setSuccess('Product updated successfully! Redirecting to inventory...');
        setTimeout(() => {
          navigate('/products');
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Edit Product</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Update inventory records and sales figures.
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
                value={formData.productCode}
                onChange={handleChange}
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <input
                type="text"
                name="supplier"
                className="form-input"
                value={formData.supplier}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <input
              type="text"
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Units Sold *</label>
              <input
                type="number"
                name="totalSold"
                className="form-input"
                min="0"
                value={formData.totalSold}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Units Returned *</label>
              <input
                type="number"
                name="totalReturned"
                className="form-input"
                min="0"
                value={formData.totalReturned}
                onChange={handleChange}
                required
              />
              <div className="form-hint">Must not exceed units sold.</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

