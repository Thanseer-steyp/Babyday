"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axiosInstance from "@/components/config/AxiosInstance";

export default function ProductDetail() {
  const params = useParams(); // get :id from route
  const searchParams = useSearchParams(); // ?type=cloth or ?type=jewellery
  const productType = searchParams.get("type");
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch product detail
  useEffect(() => {
    if (!productType) return;

    const fetchProduct = async () => {
      try {
        const endpoint =
          productType === "cloth"
            ? `public/cloth/${productId}/`
            : `public/jewellery/${productId}/`;
        const res = await axiosInstance.get(endpoint);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, productType]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  // Razorpay purchase function
  const handlePurchase = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await axiosInstance.post(
        "user/create-order/",
        {
          product_type: productType,
          product_id: productId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const options = {
        key: res.data.key,
        amount: res.data.amount,
        currency: "INR",
        order_id: res.data.order_id,
        name: `BabyDay - ${res.data.product}`,
        description: `Purchase of ${res.data.product}`,
        handler: async function (response) {
          await axiosInstance.post(
            "user/verify-payment/",
            response,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          alert("Payment Successful!");
        },
        theme: { color: "#F59E0B" },
      };

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong during purchase");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-contain mb-4"
      />
      <p className="text-xl font-semibold mb-4">₹{product.price}</p>
      <button
        onClick={handlePurchase}
        className="w-full bg-amber-600 text-white py-2 rounded"
      >
        Buy Now
      </button>
    </div>
  );
}
