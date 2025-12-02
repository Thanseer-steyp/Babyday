"use client"
import { useEffect, useState } from "react";
import axiosInstance from "@/components/config/AxiosInstance";
import Link from "next/link";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    // Fetch all products
    axiosInstance
      .get("public/products/")
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);

        // Extract unique categories from products
        const cats = Array.from(new Set(res.data.map((p) => p.category.toLowerCase())));
        setCategories(["all", ...cats]);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    if (category === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category.toLowerCase() === category));
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading products...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Products</h1>

      {/* Category Filter Buttons */}
      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryFilter(category)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              activeCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-700 mb-1">Price: ${product.price}</p>
            <p className="text-gray-500 mb-3 capitalize">Category: {product.category}</p>
            <Link href={`/products/${product.id}`}>
              <span className="mt-auto bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600 transition inline-block">
                View Details
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
