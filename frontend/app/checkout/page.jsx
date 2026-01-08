"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/includes/AuthModal";
import api from "@/components/config/Api";
import { useAuth } from "@/components/context/AuthContext";
import { useCart } from "@/components/context/CartContext";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [hasAddress, setHasAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("prepaid");
  const [showCodModal, setShowCodModal] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const { clearCart } = useCart();

  useEffect(() => {
    const loadCheckoutItems = async () => {
      const stored = localStorage.getItem("checkoutItems");
      if (!stored) return;

      try {
        const localItems = JSON.parse(stored);

        const res = await api.get("api/v1/public/products/");
        const mergedItems = mergeCheckoutWithProducts(localItems, res.data);

        setCheckoutItems(mergedItems);
      } catch (err) {
        console.error("Failed to sync checkout items", err);
      }
    };

    loadCheckoutItems();
  }, []);

  const mergeCheckoutWithProducts = (checkoutItems, products) => {
    const productMap = {};

    products.forEach((p) => {
      productMap[p.slug] = p;
    });

    return checkoutItems.map((item) => {
      const product = productMap[item.slug];

      if (!product) return item; // fallback safety

      return {
        ...item,
        mrp: product.mrp,
        price: product.price,
        delivery_charge: product.delivery_charge,
        available_stock: product.available_stock,
      };
    });
  };

  const router = useRouter();

  const confirmCodOrder = async () => {
    try {
      await api.post("api/v1/user/create-order/", {
        items: checkoutItems,
        payment_method: "cod",
        address: address,
      });

      alert("Order placed successfully (Cash on Delivery)");
      setShowCodModal(false);
      localStorage.removeItem("checkoutItems");
      clearCart();
      router.push("/orders");
      // router.push("/orders");
    } catch (err) {
      window.alert(err?.response?.data?.detail || "Failed to place COD order");
    }
  };

  const handlePayment = async () => {
    if (!checkoutItems.length) return;

    if (paymentMethod === "cod") {
      setShowCodModal(true);
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      // 1️⃣ Create order in backend
      const orderRes = await api.post("api/v1/user/create-order/", {
        items: checkoutItems,
        payment_method: paymentMethod,
        address: address,
      });

      const { razorpay_order_id, amount, razorpay_key } = orderRes.data;

      // 2️⃣ Open Razorpay checkout
      const options = {
        key: razorpay_key,
        amount,
        currency: "INR",
        name: "BABYDAY",
        order_id: razorpay_order_id,
        handler: async (response) => {
          await api.post("api/v1/user/verify-payment/", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: checkoutItems,
            address: address,
          });

          alert("Payment Successful!");
          localStorage.removeItem("checkoutItems");
          clearCart();
          router.push("/orders");
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err.response?.data);
      alert("Payment failed. Try again.");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    alt_phone: "",
    pincode: "",
    state: "",
    city: "",
    location: "",
    address_line: "",
    landmark: "",
  });

  useEffect(() => {
    if (user) {
      setStep(2);
      fetchAddress();
    }
  }, [user]);

  /* ---------------- ADDRESS ---------------- */
  const fetchAddress = async () => {
    try {
      const res = await api.get("api/v1/user/address/");
      if (res.data?.name) {
        setAddress(res.data);
        setHasAddress(true); // 👈 THIS IS KEY
      }
    } catch {}
  };

  const saveAddress = async () => {
    try {
      if (hasAddress) {
        // UPDATE
        await api.put("api/v1/user/address/", address);
      } else {
        // CREATE
        await api.post("api/v1/user/address/", address);
        setHasAddress(true);
      }

      setStep(3);
    } catch (err) {
      console.error(err.response?.data);
      alert("Failed to save address");
    }
  };

  const mrp = checkoutItems.reduce(
    (sum, item) => sum + Number(item.mrp) * item.qty,
    0
  );
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );
  const isFreeDelivery = subtotal >= 2000;

  const delivery = isFreeDelivery
    ? 0
    : checkoutItems.reduce(
        (sum, item) => sum + Number(item.delivery_charge) * item.qty,
        0
      );

  // const delivery = checkoutItems.reduce((sum, item) => {
  //   const itemTotal = Number(item.price) * item.qty;
  //   if (itemTotal > 2000) return sum;
  //   return sum + Number(item.delivery_charge) * item.qty;
  // }, 0);

  const total = subtotal + delivery;
  const discount = mrp - subtotal;

  if (!checkoutItems.length) return null;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black flex">
      <div className="w-4/5 bg-white rounded-xl p-6 shadow">
        {/* STEPPER */}
        <div className="flex justify-between mb-6 text-sm">
          <Step label="Account" active={step >= 1} done={step > 1} />
          <Step label="Address" active={step >= 2} done={step > 2} />
          <Step label="Payment" active={step >= 3} />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 className="font-bold mb-2">Account</h2>
            <button
              onClick={() => setShowAuth(true)}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Login / Register
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 className="font-bold mb-3">Delivery Address</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
                placeholder="Full Name"
              />
              <input
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                placeholder="Mobile Number"
              />
              <input
                value={address.alt_phone}
                onChange={(e) =>
                  setAddress({ ...address, alt_phone: e.target.value })
                }
                placeholder="Alt Phone (optional)"
              />
              <input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                placeholder="Pincode"
              />
              <input
                value={address.location}
                onChange={(e) =>
                  setAddress({ ...address, location: e.target.value })
                }
                placeholder="Location"
              />
              <input
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                placeholder="City / District"
              />

              <select
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <input
                value={address.address_line}
                onChange={(e) =>
                  setAddress({ ...address, address_line: e.target.value })
                }
                placeholder="Home Address (optional)"
              />
              <input
                value={address.landmark}
                onChange={(e) =>
                  setAddress({ ...address, landmark: e.target.value })
                }
                placeholder="Landmark (optional)"
              />
            </div>

            <button
              onClick={saveAddress}
              className="mt-4 px-6 py-2 bg-black text-white rounded"
            >
              {hasAddress ? "Continue" : "Save & Continue"}
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h2 className="font-bold mb-3">Payment Method</h2>

            <div className="space-y-2">
              <label className="flex gap-2 items-center">
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === "prepaid"}
                  onChange={() => setPaymentMethod("prepaid")}
                />
                <span>Prepaid</span>
              </label>

              <label className="flex gap-2 items-center">
                <input
                  // disabled
                  className="peer"
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="peer-disabled:text-gray-400">
                  Cash on Delivery
                </span>
              </label>
            </div>

            <button
              onClick={handlePayment}
              className="mt-4 w-full py-3 bg-green-600 text-white rounded"
            >
              {paymentMethod === "cod" ? "Place Order" : "Continue to Payment"}
            </button>
          </div>
        )}
      </div>
      <div className="w-1/5 bg-white">
        <div className="bg-gray-100 rounded-xl p-4 space-y-3 text-black">
          <h2 className="font-bold text-lg">Order Summary</h2>

          {checkoutItems.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm">Size: {item.size}</p>
                <p className="text-sm">Qty: {item.qty}</p>
                <p className="text-sm">
                  ₹{Number(item.price).toFixed(0)} +
                  {/* <span className="ml-1">
                    {Number(item.price) * item.qty > 2000 ? (
                      <span className="text-green-600 font-semibold">
                        Free Delivery
                      </span>
                    ) : (
                      <>₹{Number(item.delivery_charge).toFixed(0)} Shipping</>
                    )}
                  </span> */}
                  <span className="ml-1">
                    {isFreeDelivery ? (
                      <span className="text-green-600 font-semibold">
                        Free Delivery
                      </span>
                    ) : (
                      <>₹{Number(item.delivery_charge).toFixed(0)} Shipping</>
                    )}
                  </span>
                </p>
              </div>
            </div>
          ))}

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>MRP</span>
              <span>₹{mrp}</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
            <hr />

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <span className="text-center block text-xl">+</span>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{delivery === 0 ? "Free" : `₹${delivery}`}</span>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
      <CodConfirmModal
        open={showCodModal}
        onClose={() => setShowCodModal(false)}
        onConfirm={confirmCodOrder}
        total={total}
      />

      {/* AUTH MODAL */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setStep(2)}
      />
    </div>
  );
}

/* ---------------- STEP UI ---------------- */
function Step({ label, active, done }) {
  return (
    <div
      className={`flex-1 text-center ${active ? "font-bold" : "text-gray-400"}`}
    >
      {done ? "✔ " : ""}
      {label}
    </div>
  );
}

function CodConfirmModal({ open, onClose, onConfirm, total }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-black">
        <h2 className="text-lg font-bold mb-2">Confirm Cash on Delivery</h2>
        <p className="text-sm text-gray-600 mb-4">
          You will pay ₹{total} on delivery. Please confirm to place your order.
        </p>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}
