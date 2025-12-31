"use client";
import { useCart } from "@/components/context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, loading, updateQty } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cart...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Your cart is empty
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 items-center bg-white p-4 rounded-lg shadow"
          >
            {/* Image */}
            <div className="w-24">
              <img
                src={item.image1}
                alt={item.title}
                fill
                className="object-cover rounded block w-full"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-black">{item.title}</h2>
              <p className="text-gray-600">₹ {item.price}</p>
              <p className="text-gray-600">Selected size: {item.size}</p>
              <p className="text-gray-600 flex items-center">
                Qty:{" "}
                <div className="flex items-center gap-3 border rounded-lg w-fit ml-2 p-1.5">
                  <button
                    onClick={() => updateQty(item.slug, "decrease")}
                    disabled={item.quantity === 1}
                    className={`px-3 py-1 text-xl rounded 
    ${item.quantity === 1 ? "text-gray-400" : "text-black hover:bg-gray-200"}`}
                  >
                    −
                  </button>

                  <span className="w-6 text-center font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQty(item.slug, "increase")}
                    disabled={item.quantity >= item.available_stock}
                    className={`px-3 py-1 text-xl rounded 
    ${
      item.quantity >= item.available_stock
        ? "text-gray-400"
        : "text-black hover:bg-gray-200"
    }`}
                  >
                    +
                  </button>
                </div>
              </p>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeFromCart(item.slug)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Total: ₹ {total}</h2>

        <button className="px-6 py-3 bg-green-600 text-white rounded-lg">
          Checkout
        </button>
      </div>
    </div>
  );
}
