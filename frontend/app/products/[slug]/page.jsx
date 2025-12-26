"use client";

import { useEffect, useState } from "react";
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
  const { wishlistItems, addToWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const { addToCart, token, cartItems } = useCart();
  const [showBuyNow, setShowBuyNow] = useState(false);

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

  const getEstimatedDelivery = () => {
    const today = new Date();

    const start = new Date(today);
    start.setDate(today.getDate() + 2);

    const end = new Date(today);
    end.setDate(today.getDate() + 5);

    const format = (date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

    return `${format(start)} - ${format(end)}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/public/products/${slug}/`
        );
        setProduct(res.data);
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false); // 🔥 THIS WAS MISSING
      }
    };

    fetchProduct();
  }, [slug]);

  if (!product) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading product...
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

  // Collect images dynamically
  const productImages = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
  ].filter(Boolean); // remove null/undefined

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + productImages.length) % productImages.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
      >
        &larr; Back
      </button>

      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        {/* Carousel */}
        <div className="w-full md:w-1/2 relative">
          {productImages.length > 0 && (
            <>
              <img
                src={productImages[currentImage]}
                alt={`${product.title} image ${currentImage + 1}`}
                className="w-full h-80 md:h-[400px] object-cover rounded-lg"
              />

              {/* Prev/Next Buttons */}
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-black"
              >
                &#8592;
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-black"
              >
                &#8594;
              </button>

              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentImage ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl font-bold text-black capitalize">{product.title}</h1>
          <p className="text-gray-700">
            <span className="font-semibold">Category:</span>{" "}
            {AGE_CATEGORY_LABELS[product.age_category] || product.age_category}
          </p>

          <p className="text-gray-700">
            <span className="font-semibold">Material:</span>{" "}
            {product.material_type}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Fit Type:</span> {product.fit_type}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Pattern:</span>{" "}
            {product.pattern_design}
          </p>
          {product.age_limits && (
            <p className="text-gray-700">
              <span className="font-semibold">Age Limits:</span>{" "}
              {product.age_limits}
            </p>
          )}
          <p className="text-xl font-bold text-green-600">
            ₹ {product.price}{" "}
            <span className="line-through text-gray-400 text-base">
              ₹ {product.mrp}
            </span>
          </p>
          <p className="text-black ">
            {Number(product.delivery_charge) === 0
              ? "Free Delivery"
              : `Delivery Fee ₹${product.delivery_charge}`}
          </p>

          {product.available_sizes?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {product.available_sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 border rounded ${
                    selectedSize === size
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 space-x-2.5">
            <button
              onClick={() => {
                if (!selectedSize) {
                  alert("Please select a size");
                  return;
                }

                if (!token) {
                  // 🧠 save intent
                  localStorage.setItem(
                    "pendingCart",
                    JSON.stringify({ slug, size: selectedSize })
                  );

                  setShowAuth(true);
                  return;
                }

                addToCart(slug, selectedSize);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded"
            >
              Add to Cart
            </button>

            {!inWishlist ? (
              <button
                onClick={() => addToWishlist(slug)}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Add to Wishlist
              </button>
            ) : (
              <button
                onClick={() => router.push("/wishlist")}
                className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Go to Wishlist
              </button>
            )}
            <button
              onClick={() => {
                if (!selectedSize) {
                  alert("Please select a size");
                  return;
                }

                // ❌ NO token check here
                setShowBuyNow(true);
              }}
              className="px-6 py-3 bg-black text-white rounded"
            >
              Buy Now
            </button>
          </div>
          <div className="mt-3 p-3 bg-gray-100 rounded-lg flex justify-between text-sm">
            <span className="font-medium text-gray-700">
              Estimated Delivery
            </span>
            <span className="text-black font-semibold">
              {getEstimatedDelivery()}
            </span>
          </div>
        </div>
      </div>
      <BuyNowModal
        open={showBuyNow}
        onClose={() => setShowBuyNow(false)}
        product={product}
        size={selectedSize}
        onRequireAuth={() => {
          setShowBuyNow(false);
          setShowAuth(true); // open auth modal
        }}
      />

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(accessToken) => {
          const pending = localStorage.getItem("pendingCart");

          if (pending) {
            const { slug, size } = JSON.parse(pending);

            // 👇 PASS TOKEN EXPLICITLY
            addToCart(slug, size, accessToken);

            localStorage.removeItem("pendingCart");
          }
        }}
      />
    </div>
  );
}
