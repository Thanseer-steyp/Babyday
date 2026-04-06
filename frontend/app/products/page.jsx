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
      } catch (err) {
        setError("Failed to fetch");
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
      <h1 className="text-3xl font-bold text-center mb-8 text-black">
        Products
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {products.map((product) => {
            // ✅ get main image
            const mainMedia = product.media?.find((m) => m.is_main);
            const imageUrl = mainMedia?.media;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
              >
                {/* ✅ Image from media */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-72 w-full rounded-lg mb-4 object-cover"
                  />
                )}

                <h2 className="text-lg font-semibold mb-1 text-black capitalize">
                  {product.title}
                </h2>


                {/* ✅ pricing */}
                <div className="flex gap-2 items-center">
                  {product.lowest_variant_mrp && (
                    <p className="text-lg line-through text-gray-400">
                      ₹{product.lowest_variant_mrp}
                    </p>
                  )}

                  {product.lowest_variant_price && (
                    <p className="text-xl font-bold text-green-600">
                      ₹{product.lowest_variant_price}
                    </p>
                  )}

                  <p className="text-sm text-red-600">
                    + ₹{product.delivery_charge}
                  </p>
                </div>

                {/* ✅ link */}
                <Link
                  href={`/products/${product.slug}`}
                  className="bg-white shadow hover:shadow-lg transition p-2 block text-black border border-black mt-3 text-center rounded"
                >
                  View
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}