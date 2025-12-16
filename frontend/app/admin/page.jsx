"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1/public";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm());
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access")
      : null;

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products/`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  function initialForm() {
    return {
      title: "",
      age_category: "",
      product_category: "",
      mrp: "",
      price: "",
      stock_qty: "",
      material_type: "",
      fit_type: "",
      pattern_design: "",
      available_sizes: [],
      age_limits: "",
      is_available: true,
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    };
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  /* ---------------- CREATE / UPDATE ---------------- */
  const submitProduct = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value);
        }
      }
    });

    try {
      if (editingId) {
        await axios.patch(
          `${API_BASE}/products/${editingId}/`,
          data,
          { headers: authHeaders() }
        );
      } else {
        await axios.post(`${API_BASE}/products/`, data, {
          headers: authHeaders(),
        });
      }

      setFormData(initialForm());
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert("Error saving product");
    }
  };

  /* ---------------- EDIT ---------------- */
  const editProduct = (product) => {
    setEditingId(product.slug);
    setFormData({
      ...product,
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    });
  };

  /* ---------------- DELETE ---------------- */
  const deleteProduct = async (slug) => {
    if (!confirm("Delete this product?")) return;

    await axios.delete(`${API_BASE}/products/${slug}/`, {
      headers: authHeaders(),
    });

    fetchProducts();
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  });

  /* ---------------- UI ---------------- */
  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-6">Admin Products</h1>

      {/* FORM */}
      <form
        onSubmit={submitProduct}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded shadow mb-10 text-black"
      >
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="input"
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="input"
        />

        <input
          name="mrp"
          type="number"
          placeholder="MRP"
          value={formData.mrp}
          onChange={handleChange}
          className="input"
        />

        <input
          name="stock_qty"
          type="number"
          placeholder="Stock"
          value={formData.stock_qty}
          onChange={handleChange}
          className="input"
        />

        <input
          name="age_limits"
          placeholder="Age Limits"
          value={formData.age_limits}
          onChange={handleChange}
          className="input col-span-2"
        />

        <input name="image1" type="file" onChange={handleChange} />
        <input name="image2" type="file" onChange={handleChange} />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded col-span-full"
        >
          {editingId ? "Update Product" : "Create Product"}
        </button>
      </form>

      {/* PRODUCT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            {p.image1 && (
              <img
                src={p.image1}
                alt={p.title}
                className="h-40 w-full object-cover rounded"
              />
            )}
            <h3 className="font-semibold mt-2">{p.title}</h3>
            <p className="text-sm text-gray-600">₹ {p.price}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => editProduct(p)}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(p.slug)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
