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

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl p-4 shadow space-y-2"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{order.product_name}</h2>

              <StatusBadge status={order.payment_status} />
            </div>

            <div className="text-sm text-gray-600 space-y-1 flex gap-5">
              <img src={order.product_image} alt="" className="w-20" />
              <div>
                <p>Order ID: #{order.id}</p>
                <p>Size: {order.size || "N/A"}</p>
                <p>Quantity: {order.qty}</p>
                <p>Total: {order.total}</p>
                <p>Payment: {order.payment_method.toUpperCase()}</p>
                <p>
                  Ordered on: {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <p className="font-bold text-lg">₹{order.total}</p>
              {order.delivery_status === "delivered" && !order.is_reviewed && (
                <StarRating orderId={order.id} onRated={fetchOrders} />
              )}

              {order.is_reviewed && (
                <p className="text-sm text-green-600">
                  Rated: {"⭐".repeat(order.rating)}
                </p>
              )}

              {order.review && (
                <p className="text-xs text-gray-500 italic">“{order.review}”</p>
              )}

              <button
                onClick={() => router.push(`/products/${order.product_slug}`)}
                className="text-sm font-medium text-blue-600"
              >
                View Product →
              </button>
            </div>
          </div>
        ))}
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
