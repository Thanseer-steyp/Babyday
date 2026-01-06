"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function OrderCard({ order, copiedOrderId, onCopyAddress,onDeliveryUpdated, }) {
  const [editing, setEditing] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(order.delivery_status);
  const [partner, setPartner] = useState(order.delivery_partner || "");
  const [tracking, setTracking] = useState(order.tracking_code || "");
  const [remarks, setRemarks] = useState(order.remarks || "");
  const [loading, setLoading] = useState(false);

  const updateDelivery = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access");

      await axios.patch(
        `http://localhost:8000/api/v1/manager/orders/${order.id}/update-delivery/`,
        {
          delivery_status: deliveryStatus,
          delivery_partner: partner,
          tracking_code: tracking,
          remarks: remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onDeliveryUpdated?.();

      setEditing(false);
    } catch (err) {
      alert("Failed to update delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image and Basic Info */}
      <div className="flex gap-4 p-4 border-b">
        <img
          src={order.product_image}
          alt={order.product_name}
          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
        />
        <div className="flex-1">
          <p className="font-semibold text-black">{order.product_name}</p>
          <p className="text-xs text-gray-500 uppercase">
            {order.product_category}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Size: {order.size} • Qty: {order.qty}
          </p>
        </div>
      </div>

      {/* Pricing Details */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">MRP:</span>
          <span className="line-through text-gray-500">₹{order.mrp}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Discount:</span>
          <span className="text-green-600">-₹{order.discount}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Price:</span>
          <span className="text-green-600 font-medium">₹{order.price}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Delivery:</span>
          <span className="text-gray-500">₹{order.delivery_charge}</span>
        </div>
        <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t text-black">
          <span>Total:</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="p-4 border-b text-black">
        <p className="text-sm text-gray-600 mb-1">
          Payment:{" "}
          <span className="font-medium text-black uppercase">
            {order.payment_method}
          </span>{" "}
          {order.payment_channel && (
            <span className="text-xs text-gray-500">
              via {order.payment_channel}
            </span>
          )}
        </p>
        <p className="text-sm">
          Status:{" "}
          <span
            className={`font-medium ${
              order.payment_status === "paid"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {order.payment_status.toUpperCase()}
          </span>
        </p>
      </div>

      {/* Delivery Status */}
      {/* Delivery Status (Admin Editable) */}
      <div className="p-4 border-b text-black">
        {!editing ? (
          <div className="flex justify-between">
            <div>
            <p className="text-sm mb-1">
              Delivery Status:{" "}
              <span className="font-medium capitalize">
                {order.delivery_status}
              </span>
            </p>
            <p className="text-xs">
              Tracking ID: {order.tracking_code || "N/A"}
            </p>
            <p className="text-xs">
              Delivery Partner: {order.delivery_partner || "N/A"}
            </p>
            <p className="text-xs">Remarks: {order.remarks || "N/A"}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="mt-2 text-xs text-white font-medium bg-black p-2 rounded-2xl"
            >
              Update Delivery
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="ordered">Ordered</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>

            <input
              placeholder="Delivery Partner"
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />

            <input
              placeholder="Tracking Code"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />

            <textarea
              placeholder="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              rows={2}
            />

            <div className="flex gap-2">
              <button
                onClick={updateDelivery}
                disabled={loading}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs bg-gray-200 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-black">Delivery Address:</p>
          <button
            onClick={() => onCopyAddress(order)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            {copiedOrderId === order.id ? (
              <span className="text-green-600">✓ Copied!</span>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-700 capitalize">{order.name}</p>
        <p className="text-xs text-gray-700">
          {order.address_line}, {order.location}
        </p>
        <p className="text-xs text-gray-700">
          {order.city}, {order.state} - {order.pincode}
        </p>
        {order.landmark && (
          <p className="text-xs text-gray-500">Landmark: {order.landmark}</p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          Phone: {order.phone} {order.alt_phone && `/ ${order.alt_phone}`}
        </p>
      </div>

      {/* Order Details */}
      <div className="p-4">
        <p className="text-xs text-gray-500">Order ID: #{order.id}</p>
        <p className="text-xs text-gray-500">
          Ordered:{" "}
          {new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-gray-500">Ordered by: {order.user}</p>
      </div>
    </div>
  );
}
