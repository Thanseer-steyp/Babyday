"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";
import AuthModal from "../../../components/includes/AuthModal";
import BuyNowModal from "../../../components/includes/BuyNowModal";
import toast, { Toaster } from "react-hot-toast";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [showBuyNow, setShowBuyNow] = useState(false);

  const { addToCart, token, cartItems } = useCart();
  const { wishlistItems, addToWishlist } = useWishlist();

  const inWishlist = wishlistItems.some((item) => item.slug === slug);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(
        `http://localhost:8000/api/v1/public/products/${slug}/`,
      );

      setProduct(res.data);
      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  /* ---------------- VARIANTS ---------------- */
  const variants = useMemo(() => product?.variants || [], [product]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const isVariantSelected = !!selectedVariantId;

  // auto select size
  useEffect(() => {
    if (!selectedSize && variants.length) {
      setSelectedSize(variants[0].size);
    }
  }, [variants]);

  /* ---------------- GROUPED VARIANTS ---------------- */

  // Group variants by size → { S: [v1], M: [v2, v4], L: [v3, v5] }
  const sizeGroups = useMemo(() => {
    return variants.reduce((acc, v) => {
      if (!acc[v.size]) acc[v.size] = [];
      acc[v.size].push(v);
      return acc;
    }, {});
  }, [variants]);

  // Unique sizes in order, no duplicates
  const uniqueSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))],
    [variants],
  );

  // Variants belonging to the currently selected size
  const sizeVariants = useMemo(() => {
    if (!selectedSize) return [];
    return sizeGroups[selectedSize] || [];
  }, [selectedSize, sizeGroups]);

  /* ---------------- PRICE / STOCK ---------------- */

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : null;

  const totalStock = variants.reduce((sum, v) => sum + v.stock_qty, 0);

  /* ---------------- PRODUCT MEDIA (LEFT ONLY) ---------------- */
  const mainMedia = selectedVariant?.image
    ? selectedVariant.image
    : product?.media?.find((m) => m.is_main)?.media ||
      product?.media?.[0]?.media;

  const isVideo = mainMedia?.endsWith(".mp4");

  /* ---------------- DELIVERY ---------------- */
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

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <Toaster position="top-center" toastOptions={{
    duration: 1500, // default for all
  }}/>
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        {/* 🔥 LEFT → PRODUCT IMAGE ONLY */}
        <div className="w-full md:w-1/2">
          {isVideo ? (
            <video
              src={mainMedia}
              controls
              className="w-full h-[400px] object-cover rounded-lg"
            />
          ) : (
            <img
              src={mainMedia}
              className="w-full h-[400px] object-cover rounded-lg"
              alt={product.title}
            />
          )}
        </div>

        {/* 🔥 RIGHT SIDE */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{product.title}</h1>

          {/* 🔥 VARIANT IMAGE TILES — filtered by selected size */}
          <div className="flex gap-2 flex-wrap">
            {sizeVariants.map((v) =>
              v.image ? (
                <img
                  key={v.id}
                  src={v.image}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setSelectedSize(v.size);
                  }}
                  className={`h-16 w-16 object-cover rounded cursor-pointer border ${
                    selectedVariantId === v.id
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                />
              ) : null,
            )}
          </div>

          {/* 🔥 SIZE BUTTONS — unique sizes, no duplicates */}
          <div className="flex gap-2 flex-wrap">
            {uniqueSizes.map((size) => {
              const groupVariants = sizeGroups[size] || [];
              const isOutOfStock = groupVariants.every(
                (v) => v.stock_qty === 0,
              );
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  disabled={isOutOfStock}
                  onClick={() => {
                    setSelectedSize(size);
                    setSelectedVariantId(null); // 🔥 reset image selection
                  }}
                  className={`px-3 py-1 border rounded ${
                    isSelected ? "bg-green-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* 🔥 PRICE */}
          {displayPrice ? (
            <p>
              <span className="text-xl font-bold text-green-600">
                ₹ {displayPrice}
              </span>
              <span className="line-through ml-2 text-gray-400">
                ₹ {product.mrp}
              </span>
            </p>
          ) : (
            <p className="text-gray-500 italic">
              Select a variant to view price
            </p>
          )}

          {/* STOCK */}
          {selectedVariant?.stock_qty <= 5 &&
            selectedVariant?.stock_qty > 0 && (
              <p className="text-red-600">
                Only {selectedVariant.stock_qty} left!
              </p>
            )}

          {/* ACTIONS */}
          {totalStock > 0 ? (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (!selectedSize) return alert("Select size");
                  if (!selectedVariantId) {
                    toast.error("Please select a variant first");
                    return;
                  }

                  if (!token) return setShowAuth(true);
                  addToCart(slug, selectedSize);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded"
              >
                Add to Cart
              </button>

              <button
                onClick={() => {
                  
                  if (!selectedVariantId) {
                    toast.error("Please select a variant first");
                    return;
                  }else {
                    setShowBuyNow(true);
                  }
                }}
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

          {/* DELIVERY */}
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
