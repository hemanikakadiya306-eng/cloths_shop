import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUpload, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    discount: 0,
    description: '',
    category: '',
    subcategory: '',
    stock: 0,
    images: [],
    sizes: [],
    colors: []
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  const getImageUrl = (url) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http')) return url;
    // The backend returns paths like /uploads/products/filename.jpg
    // Since we use a proxy in package.json, we can just return the path
    return url;
  };

  const defaultCategories = [
    'Men',
    'Women',
    'Kids',
    'Unisex',
    'Women Accessories',
    'Men Accessories',
    'Women Cosmetic'
  ];

  const subcategories = [
    'Belt',
    'Watch',
    'Sunglasses',
    'Necklace',
    'Earrings',
    'Ring',
    'Handbag / Purse',
    'Scarf',
    'Hat / Cap',
    'Lipstick',
    'Foundation',
    'Face Powder',
    'Kajal / Eyeliner',
    'Blush',
    'Makeup Kit',
    'Wallet',
    'Tie',
    'Bracelet'
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38R', '40R', '42R', '44R', '46R', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y', '6', '7', '8', '9', '10', '11'];

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      // The admin route returns { categories: [...] }
      const dbCategories = (response.data.categories || []).map(cat => cat.name);
      const allCategories = Array.from(new Set([...defaultCategories, ...dbCategories]));
      setCategories(allCategories.map((name, index) => ({ _id: index, name })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(defaultCategories.map((name, index) => ({ _id: index, name })));
    }
  };

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      setFormData({
        ...product,
        category: product.category || '',
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || []
      });
      setImagePreview(product.images || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      setLoading(true);
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...response.data.data]
        }));
        // Update imagePreview as well to show the newly uploaded images
        setImagePreview(prev => [...prev, ...response.data.data]);
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize] });
      setNewSize('');
    }
  };

  const removeSize = (sizeToRemove) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== sizeToRemove) });
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData({ ...formData, colors: [...formData.colors, newColor] });
      setNewColor('');
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c !== colorToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      return toast.warn('Please upload at least one image');
    }
    if (formData.colors.length === 0) {
      return toast.warn('Please add at least one color');
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/admin/products/${id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', formData);
        toast.success('Product added successfully');
      }
      navigate('/products');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Fetching product details...</div>;

  return (
    <div className="add-product-content">
      <div className="page-header">
        <button onClick={() => navigate('/products')} className="back-btn">
          <FiArrowLeft />
          <span>Back to Products</span>
        </button>
        <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-main">
            <div className="form-card">
              <h2>Basic Information</h2>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="5"
                  required
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input 
                    type="text" 
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subcategory</label>
                  <select 
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Subcategory (Optional)</option>
                    {subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h2>Attributes (Sizes & Colors)</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Add Sizes</label>
                  <div className="input-with-btn">
                    <select value={newSize} onChange={(e) => setNewSize(e.target.value)}>
                      <option value="">Select Size</option>
                      {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button type="button" onClick={addSize} className="add-attr-btn"><FiPlus /></button>
                  </div>
                  <div className="tags-container">
                    {formData.sizes.map(s => (
                      <span key={s} className="tag">
                        {s} <FiX onClick={() => removeSize(s)} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Add Colors</label>
                  <div className="input-with-btn">
                    <input 
                      type="text" 
                      value={newColor} 
                      onChange={(e) => setNewColor(e.target.value)} 
                      placeholder="e.g. Red"
                    />
                    <button type="button" onClick={addColor} className="add-attr-btn"><FiPlus /></button>
                  </div>
                  <div className="tags-container">
                    {formData.colors.map(c => (
                      <span key={c} className="tag">
                        {c} <FiX onClick={() => removeColor(c)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h2>Pricing & Stock</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input 
                    type="number" 
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-side">
            <div className="form-card">
              <h2>Product Images</h2>
              <div className="image-upload-container">
                <label className="upload-box">
                  <FiUpload className="upload-icon" />
                  <span>Click to upload images</span>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleImageUpload} 
                    hidden 
                    accept="image/*"
                  />
                </label>
                <div className="image-previews">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="preview-item">
                      <img src={getImageUrl(img)} alt={`Preview ${index}`} />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        className="remove-img-btn"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
