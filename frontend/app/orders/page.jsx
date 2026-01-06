"use client";

import { useEffect, useState } from "react";
import api from "@/components/config/Api";
import { useRouter } from "next/navigation";
import StarRating from "../../components/includes/StarRating";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("api/v1/user/orders/");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen text-center text-white">Loading orders...</div>
    );
  }

  if (!orders.length) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <p className="text-lg font-semibold text-center">No orders found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-black p-2 rounded bg-white"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">My Orders</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image and Basic Info */}
              <div className="flex gap-4 p-4 border-b">
                <button
                  onClick={() => router.push(`/products/${o.product_slug}`)}
                  className="text-sm font-medium text-blue-600"
                >
                  <img
                    src={o.product_image}
                    alt={o.product_name}
                    className="w-20 h-20 object-cover rounded"
                  />
                </button>
                <div className="flex-1">
                  <p className=" text-black min-h-[48px]">{o.product_name}</p>
                  <p className="text-xs text-gray-500">{o.product_category}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Size: {o.size} • Qty: {o.qty}
                  </p>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">MRP:</span>
                  <span className="line-through text-gray-500">₹{o.mrp}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">-₹{o.discount}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Price:</span>
                  <span className="text-green-600 font-medium">₹{o.price}</span>
                </div>

                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Delivery:</span>
                  <span>₹{o.delivery_charge}</span>
                </div>
                <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t text-black">
                  <span>Total:</span>
                  <span>₹{o.total}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-4 border-b text-black">
                <p className="text-sm text-gray-600 mb-1">
                  Payment:{" "}
                  <span className="font-medium text-black uppercase">
                    {o.payment_method}
                  </span>{" "}
                  {o.payment_channel && (
                    <span className="text-xs text-gray-500">
                      via {o.payment_channel}
                    </span>
                  )}
                </p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      o.payment_status === "paid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {o.payment_status.toUpperCase()}
                  </span>
                </p>
              </div>

              {/* Delivery Status */}
              <div className="p-4 border-b text-black">
                <p className="text-sm mb-1">
                  Delivery Status:{" "}
                  <span
                    className={`font-medium capitalize ${
                      o.delivery_status === "delivered"
                        ? "text-green-600"
                        : o.delivery_status === "shipped"
                        ? "text-blue-600"
                        : o.delivery_status === "processing"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {o.delivery_status}
                  </span>
                </p>

                <p className="text-xs text-black">
                  Tracking ID: {o.tracking_code || "N/A"}
                </p>

                <p className="text-xs text-black">
                  Delivery Partner: {o.delivery_partner || "N/A"}
                </p>
                <p className="text-xs text-black">
                  Remarks: {o.remarks || "N/A"}
                </p>
              </div>

              {/* Delivery Address */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-black">
                    Delivery Address:
                  </p>
                </div>
                <p className="text-xs text-gray-700 capitalize">{o.name}</p>
                <p className="text-xs text-gray-700">
                  {o.address_line}, {o.location}
                </p>
                <p className="text-xs text-gray-700">
                  {o.city}, {o.state} - {o.pincode}
                </p>
                {o.landmark && (
                  <p className="text-xs text-gray-500">
                    Landmark: {o.landmark}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  Phone: {o.phone} {o.alt_phone && `/ ${o.alt_phone}`}
                </p>
              </div>

              {/* Order Details */}
              <div className="p-4">
                <p className="text-xs text-gray-500">Order ID: #{o.id}</p>
                <p className="text-xs text-gray-500">
                  Ordered:{" "}
                  {new Date(o.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-gray-500">Ordered by: {o.user}</p>
              </div>
              <div className="border-t min-h-10 w-full p-4 flex justify-center">
                <div>
                  {o.delivery_status === "delivered" && !o.is_reviewed && (
                    <StarRating orderId={o.id} onRated={fetchOrders} />
                  )}
                  {o.is_reviewed && (
                    <p className="text-2xl text-yellow-400">
                      {"★".repeat(o.rating)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- STATUS BADGE ---------------- */

function StatusBadge({ status }) {
  const styles = {
    initiated: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
