"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/components/config/AxiosInstance";

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("You must log in to view cart");
      return;
    }

    axiosInstance
      .get("user/cart/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>

      {items.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border p-3 rounded bg-gray-100 flex gap-4"
            >
              <img
                src={item.product_image}
                alt={item.product_name}
                className="w-24 h-24 object-contain bg-white rounded"
              />

              <div className="flex flex-col justify-center">
                <h2 className="text-xl font-semibold">{item.product_name}</h2>
                <p className="text-lg">₹{item.product_price}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
