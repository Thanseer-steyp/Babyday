"use client";

export default function BuyNowModal({
  open,
  onClose,
  product,
  size,
  onRequireAuth,
}) {
  if (!open || !product) return null;

  const mrp = Number(product.mrp);
  const price = Number(product.price);
  const charge = Number(product.delivery_charge);
  const discount = mrp - price;
  const total = price + charge;
  const qty = 1;

  const handleCheckout = () => {
    if (product.available_sizes && !size) {
      alert("Please select a size");
      return;
    }
    // always save checkout intent
    localStorage.setItem(
      "checkoutItems",
      JSON.stringify([
        {
          product_id: product.id,
          slug: product.slug,
          title: product.title,
          image: product.image1,
          size,
          qty,
        },
      ])
    );

    window.location.href = "/checkout";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md p-6 text-black">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

        {/* Product Preview */}
        <div className="flex gap-4 mb-4 items-center">
          <img
            src={product.image1}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-lg border"
          />
          <div>
            <p className="font-semibold">{product.title}</p>
            <p className="text-sm text-gray-600">Size: {size}</p>
            <p className="text-sm text-gray-600">Qty: {qty}</p>
          </div>
        </div>

        {/* Bill */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>MRP</span>
            <span>₹{mrp}</span>
          </div>

          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{discount}</span>
          </div>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{price}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span>
              {charge === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                `₹${charge}`
              )}
            </span>
          </div>

          <hr />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={handleCheckout}
            className="flex-1 py-2 bg-green-600 text-white rounded"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
