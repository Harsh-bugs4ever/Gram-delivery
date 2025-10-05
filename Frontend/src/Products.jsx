import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductsPage = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productName: '',
    quantity: '',
    weight: '',
    cost: '',
    fromLocation: '',
    toLocation: ''
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/products`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts([res.data.product, ...products]);
      setForm({
        productName: '',
        quantity: '',
        weight: '',
        cost: '',
        fromLocation: '',
        toLocation: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>My Products</h2>
      <form onSubmit={handleCreate}>
        <input name="productName" placeholder="Product Name" value={form.productName} onChange={handleChange} required />
        <input name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
        <input name="weight" type="number" placeholder="Weight" value={form.weight} onChange={handleChange} required />
        <input name="cost" type="number" placeholder="Cost" value={form.cost} onChange={handleChange} required />
        <input name="fromLocation" placeholder="From" value={form.fromLocation} onChange={handleChange} required />
        <input name="toLocation" placeholder="To" value={form.toLocation} onChange={handleChange} required />
        <button type="submit">Add Product</button>
      </form>

      <ul>
        {products.map(p => (
          <li key={p._id}>
            {p.productName} - {p.quantity} - Status: {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsPage;
