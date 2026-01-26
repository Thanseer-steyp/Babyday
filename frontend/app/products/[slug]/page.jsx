"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";
import AuthModal from "../../../components/includes/AuthModal";
import BuyNowModal from "../../../components/includes/BuyNowModal";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showBuyNow, setShowBuyNow] = useState(false);

  const { addToCart, token, cartItems } = useCart();
  const { wishlistItems, addToWishlist } = useWishlist();

  const inWishlist = wishlistItems.some((item) => item.slug === slug);
  const inCart = cartItems.some((item) => item.slug === slug);

  const AGE_CATEGORY_LABELS = {
    kids_boy: "Kids (Boy)",
    kids_girl: "Kids (Girl)",
    kids_unisex: "Kids (Unisex)",
    adults_men: "Adults (Men)",
    adults_women: "Adults (Women)",
    adults_unisex: "Adults (Unisex)",
    all_age_men: "All Age (Men)",
    all_age_women: "All Age (Women)",
    all_age_unisex: "All Age (Unisex)",
  };

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/public/products/${slug}/`,
        );
        setProduct(res.data);
      } catch {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /* ---------------- VARIANT DERIVED DATA ---------------- */
  const variants = useMemo(() => product?.variants || [], [product]);

  const cheapestVariant = useMemo(() => {
    if (!variants.length) return null;
    return [...variants].sort((a, b) => Number(a.price) - Number(b.price))[0];
  }, [variants]);

  // Auto-select cheapest size
  useEffect(() => {
    if (cheapestVariant && !selectedSize) {
      setSelectedSize(cheapestVariant.size);
    }
  }, [cheapestVariant, selectedSize]);

  const selectedVariant = variants.find((v) => v.size === selectedSize);

  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product?.price || 0);

  const totalStock = variants.reduce((sum, v) => sum + v.stock_qty, 0);

  /* ---------------- DELIVERY DATE ---------------- */
  const getEstimatedDelivery = () => {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);
    start.setDate(today.getDate() + 2);
    end.setDate(today.getDate() + 5);

    const format = (d) =>
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

    return `${format(start)} - ${format(end)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  /* ---------------- IMAGES ---------------- */
  const productImages = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
  ].filter(Boolean);

  const nextImage = () =>
    setCurrentImage((i) => (i + 1) % productImages.length);
  const prevImage = () =>
    setCurrentImage(
      (i) => (i - 1 + productImages.length) % productImages.length,
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        {/* IMAGE CAROUSEL */}
        <div className="w-full md:w-1/2 relative">
          <img
            src={productImages[currentImage]}
            className="w-full h-[400px] object-cover rounded-lg"
            alt={product.title}
          />
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 bg-gray-200 p-2 rounded-full"
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 bg-gray-200 p-2 rounded-full"
          >
            →
          </button>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl font-bold">{product.title}</h1>

          <p className="text-gray-700">
            {AGE_CATEGORY_LABELS[product.age_category]}
          </p>

          <p>
            <span className="text-xl font-bold text-green-600">
              ₹ {displayPrice}
            </span>
            <span className="line-through ml-2 text-gray-400">
              ₹ {product.mrp}
            </span>
          </p>

          {selectedVariant?.stock_qty <= 5 &&
            selectedVariant?.stock_qty > 0 && (
              <p className="text-red-600 font-semibold">
                Only {selectedVariant.stock_qty} left!
              </p>
            )}

          {/* SIZE SELECTOR */}
          <div className="flex gap-2 flex-wrap">
            {variants.map((v) => (
              <button
                key={v.size}
                disabled={v.stock_qty === 0}
                onClick={() => setSelectedSize(v.size)}
                className={`px-3 py-1 border rounded ${
                  selectedSize === v.size
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                } ${v.stock_qty === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {v.size}
              </button>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          {totalStock > 0 ? (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (!selectedSize) {
                    alert("Please select a size");
                    return;
                  }

                  if (!token) {
                    setShowAuth(true);
                    return;
                  }

                  addToCart(slug, selectedSize);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded"
              >
                Add to Cart
              </button>

              <button
                onClick={() => setShowBuyNow(true)}
                className="px-6 py-3 bg-black text-white rounded"
              >
                Buy Now
              </button>
            </div>
          ) : (
            <p className="text-red-600 font-bold">Out of Stock</p>
          )}

          {/* WISHLIST */}
          {!inWishlist ? (
            <button
              onClick={() => (token ? addToWishlist(slug) : setShowAuth(true))}
              className="mt-3 px-6 py-2 bg-red-600 text-white rounded"
            >
              Add to Wishlist
            </button>
          ) : (
            <button
              onClick={() => router.push("/wishlist")}
              className="mt-3 px-6 py-2 bg-black text-white rounded"
            >
              Go to Wishlist
            </button>
          )}

          <div className="mt-4 bg-gray-100 p-3 rounded flex justify-between">
            <span>Estimated Delivery</span>
            <strong>{getEstimatedDelivery()}</strong>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <BuyNowModal
        open={showBuyNow}
        onClose={() => setShowBuyNow(false)}
        product={product}
        size={selectedSize}
        onRequireAuth={() => {
          setShowBuyNow(false);
          setShowAuth(true);
        }}
      />

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(accessToken) => {
          addToCart(slug, selectedSize, accessToken);
        }}
      />
    </div>
  );
}
