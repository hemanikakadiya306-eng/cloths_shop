import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      const data = response.data.data || response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) return toast.warn('Category name is required');

    try {
      await api.post('/admin/categories', newCategory);
      toast.success('Category added successfully');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Add category error:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This may affect products in this category.')) {
      try {
        await api.delete(`/admin/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  if (loading) return <div className="loading">Loading categories...</div>;

  return (
    <div className="categories-content">
      <div className="page-header">
        <h1>Category Management</h1>
        <p>Manage product categories</p>
      </div>

      <div className="dashboard-grid">
        <div className="form-card">
          <h2>Add New Category</h2>
          <form onSubmit={handleAddCategory}>
            <div className="form-group">
              <label>Category Name</label>
              <input 
                type="text" 
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g. Summer Collection"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Brief description..."
                rows="3"
              ></textarea>
            </div>
            <button type="submit" className="add-btn" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
              <FiPlus />
              <span>Add Category</span>
            </button>
          </form>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Products Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiTag style={{ color: '#ff3f6c' }} />
                        {cat.name}
                      </div>
                    </td>
                    <td>{cat.count || 0} Products</td>
                    <td>
                      <button onClick={() => handleDelete(cat._id)} className="delete-btn">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
