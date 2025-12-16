"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/public/products/"
        );
        setProducts(res.data);
        console.log(res.data)
      } catch (err) {
        setError(err.response?.data || err.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">Products</h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
            >
              {product.image1 && (
                <img
                  src={product.image1}
                  alt={product.title}
                  className="h-48 w-full object-cover rounded-lg mb-4"
                />
              )}

              <h2 className="text-lg font-semibold mb-1 text-black">{product.title}</h2>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.age_limits || product.pattern_design}
              </p>

              <p className="text-xl font-bold text-green-600">
                ₹ {product.price}
              </p>

              {product.available_sizes?.length > 0 && (
                <div className="my-2 flex flex-wrap gap-2">
                  {product.available_sizes.map((size) => (
                    <span
                      key={size}
                      className="px-2 py-1 border rounded text-sm bg-gray-300 text-black"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              )}
              <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="bg-white shadow hover:shadow-lg transition p-1 block text-black border border-black w-max"
            >View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
