"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";
import AuthModal from "../../../components/includes/AuthModal";
import BuyNowModal from "../../../components/includes/BuyNowModal";
import toast, { Toaster } from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useRef } from "react";

import "swiper/css";
import "swiper/css/navigation";

// ── Inline styles for the kids theme ──────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #fff8f0 0%, #fff0f8 50%, #f0f8ff 100%)",
    padding: "24px 16px",
    fontFamily: "'Nunito', 'Fredoka One', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bubbleBg: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    overflow: "hidden",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    padding: "10px 20px",
    background: "#fff",
    border: "2.5px solid #f9a8d4",
    borderRadius: 50,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#be185d",
    fontFamily: "inherit",
    transition: "transform 0.15s",
  },
  card: {
    background: "#fff",
    borderRadius: 28,
    boxShadow:
      "0 8px 40px 0 rgba(249,168,212,0.18), 0 2px 8px rgba(0,0,0,0.06)",
    padding: "32px 28px",
    display: "flex",
    flexWrap: "nowrap",
    gap: 32,
    border: "2px solid #fce7f3",
    position: "relative",
  },
  imageWrap: {
    width: "50%",
    maxWidth: "50%",
    position: "relative",
    background: "linear-gradient(135deg, #fff0f8 0%, #eff6ff 100%)",
    padding: 10,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    objectFit: "contain", // 🔥 important
  },
  badgeNew: {
    position: "absolute",
    top: 16,
    left: 16,
    background: "linear-gradient(90deg,#f9a8d4,#a78bfa)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 12,
    borderRadius: 20,
    padding: "4px 14px",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    boxShadow: "0 2px 8px rgba(167,139,250,0.3)",
  },
  right: {
    width: "50%",
    maxWidth: "50%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: "#1e1b4b",
    lineHeight: 1.3,
    margin: 0,
    fontFamily: "'Nunito', system-ui, sans-serif",
  },
  starRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  stars: {
    display: "flex",
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: "#fbbf24",
  },
  ratingText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: 600,
  },
  variantTilesLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#7c3aed",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  variantTilesRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  variantTile: (selected) => ({
    width: 64,
    height: 64,
    objectFit: "cover",
    borderRadius: 14,
    cursor: "pointer",
    border: selected ? "3px solid #7c3aed" : "2.5px solid #e5e7eb",
    boxShadow: selected ? "0 0 0 3px #ddd6fe" : "none",
    transition: "border 0.15s, box-shadow 0.15s",
  }),
  sizeLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#be185d",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  sizeRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  sizeBtn: (selected, outOfStock) => ({
    padding: "8px 18px",
    border: selected ? "2.5px solid #7c3aed" : "2px solid #e5e7eb",
    borderRadius: 12,
    background: selected
      ? "linear-gradient(90deg,#7c3aed,#a78bfa)"
      : outOfStock
        ? "#f3f4f6"
        : "#fff",
    color: selected ? "#fff" : outOfStock ? "#d1d5db" : "#374151",
    fontWeight: 700,
    fontSize: 14,
    cursor: outOfStock ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    textDecoration: outOfStock ? "line-through" : "none",
    transition: "all 0.15s",
    boxShadow: selected ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
  }),
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  priceMain: {
    fontSize: 32,
    fontWeight: 800,
    color: "#059669",
    fontFamily: "inherit",
  },
  priceStrike: {
    fontSize: 16,
    color: "#d1d5db",
    textDecoration: "line-through",
    fontWeight: 600,
  },
  saveBadge: {
    background: "#dcfce7",
    color: "#15803d",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    padding: "3px 10px",
  },
  priceHint: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
  },
  stockAlert: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#fff7ed",
    border: "1.5px solid #fed7aa",
    borderRadius: 10,
    padding: "6px 14px",
    color: "#c2410c",
    fontWeight: 700,
    fontSize: 13,
  },
  actionRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  addCartBtn: {
    flex: 1,
    minWidth: 140,
    padding: "14px 20px",
    background: "linear-gradient(90deg,#059669,#34d399)",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(5,150,105,0.3)",
    transition: "transform 0.12s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buyNowBtn: {
    flex: 1,
    minWidth: 140,
    padding: "14px 20px",
    background: "linear-gradient(90deg,#7c3aed,#ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
    transition: "transform 0.12s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  outOfStock: {
    padding: "14px 24px",
    background: "#f3f4f6",
    border: "2px dashed #d1d5db",
    borderRadius: 16,
    color: "#9ca3af",
    fontWeight: 800,
    fontSize: 15,
    textAlign: "center",
  },
  wishlistBtnAdd: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "11px 22px",
    background: "#fff0f8",
    border: "2px solid #f9a8d4",
    borderRadius: 14,
    color: "#be185d",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
  wishlistBtnGo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "11px 22px",
    background: "#1e1b4b",
    border: "none",
    borderRadius: 14,
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  deliveryBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(90deg,#eff6ff,#f0fdf4)",
    borderRadius: 14,
    padding: "12px 18px",
    border: "1.5px solid #bfdbfe",
  },
  deliveryLabel: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: 700,
  },
  deliveryDate: {
    fontSize: 13,
    fontWeight: 800,
    color: "#1d4ed8",
  },
  freeShip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#dcfce7",
    border: "1.5px solid #86efac",
    borderRadius: 8,
    padding: "3px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "#15803d",
  },
  featuresBox: {
    background: "#faf5ff",
    borderRadius: 14,
    padding: "14px 18px",
    border: "1.5px solid #e9d5ff",
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#7c3aed",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  featuresList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  featureItem: {
    fontSize: 13,
    color: "#4c1d95",
    fontWeight: 600,
  },
  trustRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  trustBadge: (bg, color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: bg,
    borderRadius: 10,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: color,
  }),
};

// Decorative background blobs (pure CSS, no SVG)
function BgBubbles() {
  const bubbles = [
    { size: 180, top: "5%", left: "-4%", color: "#fce7f3", opacity: 0.6 },
    { size: 120, top: "20%", right: "-3%", color: "#ede9fe", opacity: 0.5 },
    { size: 90, bottom: "12%", left: "8%", color: "#dcfce7", opacity: 0.5 },
    { size: 140, bottom: "5%", right: "6%", color: "#dbeafe", opacity: 0.45 },
    { size: 60, top: "50%", left: "45%", color: "#fef9c3", opacity: 0.5 },
  ];
  return (
    <div style={styles.bubbleBg}>
      {bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: b.color,
            opacity: b.opacity,
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
          }}
        />
      ))}
    </div>
  );
}

function StarRating({ rating = 0, count = 0 }) {
  return (
    <div style={styles.starRow}>
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            style={{
              ...styles.star,
              color: s <= Math.round(rating) ? "#fbbf24" : "#e5e7eb",
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span style={styles.ratingText}>
        {count > 0 ? `${rating.toFixed(1)} (${count})` : "No reviews yet"}
      </span>
    </div>
  );
}

function Features({ text }) {
  if (!text) return null;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <div style={styles.featuresBox}>
      <div style={styles.featuresTitle}>✦ Features</div>
      <ul style={styles.featuresList}>
        {lines.map((line, i) => (
          <li key={i} style={styles.featureItem}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

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
  useEffect(() => {
  if (selectedVariantId && swiperRef.current) {
    swiperRef.current.slideTo(0);
  }
}, [selectedVariantId]);

  /* ---------------- GROUPED VARIANTS ---------------- */
  const sizeGroups = useMemo(() => {
    return variants.reduce((acc, v) => {
      if (!acc[v.size]) acc[v.size] = [];
      acc[v.size].push(v);
      return acc;
    }, {});
  }, [variants]);

  const uniqueSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))],
    [variants],
  );

  const sizeVariants = useMemo(() => {
    if (!selectedSize) return [];
    return sizeGroups[selectedSize] || [];
  }, [selectedSize, sizeGroups]);

  /* ---------------- PRICE / STOCK ---------------- */
  const displayPrice = selectedVariant ? Number(selectedVariant.price) : null;
  const totalStock = variants.reduce((sum, v) => sum + v.stock_qty, 0);

  const savingsPct =
    displayPrice && product?.mrp
      ? Math.round((1 - displayPrice / Number(product.mrp)) * 100)
      : null;

  /* ---------------- PRODUCT MEDIA ---------------- */
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
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${format(start)} – ${format(end)}`;
  };

  if (loading || !product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#fff8f0,#f0f8ff)",
          fontFamily: "'Nunito', system-ui",
          fontSize: 18,
          color: "#7c3aed",
          fontWeight: 700,
        }}
      >
        🎀 Loading your adorable product...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Google font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1500,
          style: {
            fontFamily: "'Nunito', system-ui",
            fontWeight: 700,
            borderRadius: 16,
            fontSize: 14,
          },
        }}
      />

      <BgBubbles />

      <div style={styles.container}>
        {/* ← Back */}
        {/* <button
          style={styles.backBtn}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={() => router.back()}
        >
          ← Back
        </button> */}

        <div style={styles.card}>
          {/* ─── LEFT: Product Image ─── */}
          <div style={styles.imageWrap} className="relative">
            <button
              onClick={() => {
                if (!selectedVariantId) {
                  toast.error("Please select a variant first");
                  return;
                }

                if (!token) {
                  setShowAuth(true);
                  return;
                }

                if (inWishlist) {
                  router.push("/wishlist");
                } else {
                  addToWishlist(slug);
                  toast.success("Added to wishlist ❤️");
                }
              }}
              className={`border border-white p-1 rounded-full absolute top-4 right-4 text-2xl transition transform hover:scale-110 ${
                inWishlist ? "text-red-600" : "text-gray-400"
              }`}
            >
              {inWishlist ? "❤️" : "🤍"}
            </button>
            {/* <div style={styles.badgeNew}>✨ New Arrival</div> */}
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              modules={[Navigation]}
              navigation
              spaceBetween={10}
              slidesPerView={1}
              initialSlide={0} // always start from first
              style={{
                height: "400px",
                borderRadius: 20,
              }}
            >
              {/* ✅ Variant FIRST */}
              {selectedVariant?.image && (
                <SwiperSlide key="variant-first">
                  <img
                    src={selectedVariant.image}
                    style={styles.productImage}
                    alt="variant"
                  />
                </SwiperSlide>
              )}

              {/* ✅ Then product media */}
              {product.media.map((m) => (
                <SwiperSlide key={m.id}>
                  {m.media.endsWith(".mp4") ? (
                    <video src={m.media} controls style={styles.productImage} />
                  ) : (
                    <img
                      src={m.media}
                      style={styles.productImage}
                      alt="product"
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
            {/* <Swiper slidesPerView={8} spaceBetween={10}>
              {product.media.map((m) => (
                <SwiperSlide key={m.id}>
                  <img src={m.media} style={{ width: "100%" }} />
                </SwiperSlide>
              ))}
            </Swiper> */}
            <div>
              <Features text={product.features} />
            </div>
          </div>

          {/* ─── RIGHT SIDE ─── */}
          <div style={styles.right}>
            <h1 style={styles.title}>{product.title}</h1>

            {/* Stars */}
            <StarRating
              rating={product.average_rating}
              count={product.rating_count}
            />

            {/* Material badge */}
            {product.material_type && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={styles.trustBadge("#fff0f8", "#be185d")}>
                  🧵 {product.material_type}
                </span>
                <span style={styles.freeShip}>🚚 Free Delivery</span>
              </div>
            )}

            {/* Variant image tiles */}
            {sizeVariants.some((v) => v.image) && (
              <div>
                <div style={styles.variantTilesLabel}>Pick a Style</div>
                <div style={styles.variantTilesRow}>
                  {sizeVariants.map((v) =>
                    v.image ? (
                      <img
                        key={v.id}
                        src={v.image}
                        alt={`Variant ${v.id}`}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setSelectedSize(v.size);
                          setTimeout(() => {
                            swiperRef.current?.slideTo(0); // ✅ go to first slide
                          }, 0);
                        }}
                        style={styles.variantTile(selectedVariantId === v.id)}
                      />
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Size buttons */}
            <div>
              <div style={styles.sizeLabel}>Select Size</div>
              <div style={styles.sizeRow}>
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
                        setSelectedVariantId(null);
                      }}
                      style={styles.sizeBtn(isSelected, isOutOfStock)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price */}
            {displayPrice ? (
              <div style={styles.priceRow}>
                <span style={styles.priceMain}>₹{displayPrice}</span>
                <span style={styles.priceStrike}>₹{product.mrp}</span>
                {savingsPct > 0 && (
                  <span style={styles.saveBadge}>{savingsPct}% OFF</span>
                )}
              </div>
            ) : (
              <p style={styles.priceHint}>🎨 Select a variant to view price</p>
            )}

            {/* Low stock */}
            {selectedVariant?.stock_qty <= 5 &&
              selectedVariant?.stock_qty > 0 && (
                <div style={styles.stockAlert}>
                  🔥 Only {selectedVariant.stock_qty} left — hurry!
                </div>
              )}

            {/* Action buttons */}
            {totalStock > 0 ? (
              <div style={styles.actionRow}>
                <button
                  style={styles.addCartBtn}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={() => {
                    if (!selectedSize) return alert("Select size");
                    if (!selectedVariantId) {
                      toast.error("Please select a variant first");
                      return;
                    }
                    if (!token) return setShowAuth(true);
                    addToCart(slug, selectedSize);
                  }}
                >
                  🛒 Add to Cart
                </button>

                <button
                  style={styles.buyNowBtn}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={() => {
                    if (!selectedVariantId) {
                      toast.error("Please select a variant first");
                      return;
                    }
                    setShowBuyNow(true);
                  }}
                >
                  ⚡ Buy Now
                </button>
              </div>
            ) : (
              <div style={styles.outOfStock}>😔 Out of Stock</div>
            )}

            {/* Wishlist */}
            {/* {!inWishlist ? (
              <button
                style={styles.wishlistBtnAdd}
                onClick={() => (token ? addToWishlist(slug) : setShowAuth(true))}
              >
                🤍 Add to Wishlist
              </button>
            ) : (
              <button
                style={styles.wishlistBtnGo}
                onClick={() => router.push("/wishlist")}
              >
                💖 Go to Wishlist
              </button>
            )} */}

            {/* Delivery */}
            <div style={styles.deliveryBox}>
              <div style={styles.deliveryLabel}>🚀 Estimated Delivery</div>
              <strong style={styles.deliveryDate}>
                {getEstimatedDelivery()}
              </strong>
            </div>

            {/* Trust badges */}
            <div style={styles.trustRow}>
              <span style={styles.trustBadge("#f0fdf4", "#15803d")}>
                ✅ 100% Safe
              </span>
              <span style={styles.trustBadge("#eff6ff", "#1d4ed8")}>
                🔒 Secure Payment
              </span>
              <span style={styles.trustBadge("#faf5ff", "#7c3aed")}>
                ↩ Easy Returns
              </span>
            </div>

            {/* Features */}
          </div>
        </div>
      </div>

      {/* Modals */}
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
