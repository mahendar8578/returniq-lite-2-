import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Eye, 
  X,
  RefreshCw 
} from 'lucide-react';
import { productsApi, getErrorMessage } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productsApi.getAll();
      if (res.data && res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionError(null);
      const res = await productsApi.delete(deleteId);
      if (res.data && res.data.success) {
        setActionSuccess('Product deleted successfully');
        setDeleteId(null);
        loadProducts();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  // Derive categories for filter
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading product catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-box error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          <strong>Error Loading Products</strong>
        </div>
        <p>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={loadProducts}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Product Inventory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track product units sold, logged returns, and live alert statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadProducts}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/products/add" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Add New Product
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

      {/* Search & Filter Controls */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by product name, code, or supplier..."
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '130px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={40} className="empty-state-icon" />
            <div className="empty-state-text">No products found</div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              {products.length === 0 ? 'No products registered yet. Click "Add New Product" to begin.' : 'No items match your filter criteria.'}
            </p>
            {products.length === 0 && (
              <Link to="/products/add" className="btn btn-primary btn-sm">
                <PlusCircle size={14} /> Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Product Code</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: 'right' }}>Units Sold</th>
                  <th style={{ textAlign: 'right' }}>Returns</th>
                  <th style={{ textAlign: 'right' }}>Return Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isAlert = product.status === 'ALERT';
                  return (
                    <tr key={product._id}>
                      <td style={{ fontWeight: 600 }}>{product.productName}</td>
                      <td>
                        <code>{product.productCode}</code>
                      </td>
                      <td>
                        <span className="badge badge-category">{product.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{product.supplier}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        {product.totalSold?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: isAlert ? 'var(--alert-red)' : 'inherit' }}>
                        {product.totalReturned?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isAlert ? 'var(--alert-red)' : 'var(--healthy-green)' }}>
                        {product.returnRate}%
                      </td>
                      <td>
                        <span className={`badge ${isAlert ? 'badge-alert' : 'badge-healthy'}`}>
                          {isAlert ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                          {product.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <button
                            className="btn-icon"
                            title="View Details"
                            onClick={() => setViewProduct(product)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            title="Edit Product"
                            onClick={() => navigate(`/products/edit/${product._id}`)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Delete Product"
                            onClick={() => setDeleteId(product._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Product Details Modal */}
      {viewProduct && (
        <div className="modal-overlay" onClick={() => setViewProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Product Intelligence Sheet</h3>
              <button className="btn-icon" onClick={() => setViewProduct(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Product Name</span>
                <strong style={{ fontSize: '1.05rem' }}>{viewProduct.productName}</strong>
              </div>

              <div className="form-row">
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Product Code</span>
                  <code>{viewProduct.productCode}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Category</span>
                  <span className="badge badge-category">{viewProduct.category}</span>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Supplier</span>
                  <span>{viewProduct.supplier}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Health Status</span>
                  <span className={`badge ${viewProduct.status === 'ALERT' ? 'badge-alert' : 'badge-healthy'}`}>
                    {viewProduct.status}
                  </span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Units Sold:</span>
                  <strong>{viewProduct.totalSold}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Units Returned:</span>
                  <strong style={{ color: viewProduct.status === 'ALERT' ? 'var(--alert-red)' : 'inherit' }}>
                    {viewProduct.totalReturned}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                  <span>Return Rate:</span>
                  <strong style={{ color: viewProduct.status === 'ALERT' ? 'var(--alert-red)' : 'var(--healthy-green)', fontSize: '1.1rem' }}>
                    {viewProduct.returnRate}%
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => {
                  const id = viewProduct._id;
                  setViewProduct(null);
                  navigate(`/products/edit/${id}`);
                }}
              >
                <Edit3 size={14} /> Edit Product
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setViewProduct(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--alert-red)' }}>
                Confirm Product Deletion
              </h3>
              <button className="btn-icon" onClick={() => setDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Are you sure you want to permanently delete this product?
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Note: Deleting this product will also remove any return records associated with it. This action cannot be undone.
            </p>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                <Trash2 size={14} /> Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

