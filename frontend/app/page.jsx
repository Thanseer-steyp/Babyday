"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Products() {
  const router = useRouter()
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    axios.get("http://localhost:8000/api/products/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setProducts(res.data);
    })
    .catch(() => {
      alert("You must login to view products");
    });
  }, []);

  return (
    <div>
      <h2 className="text-center text-xl">Products</h2>
      {products.map((p) => (
        <div key={p.id} className="border border-white w-max p-2 bg-amber-100">
          <h3 className="text-black text-center text-lg">{p.name}</h3>
          <h3 className="text-black text-center text-lg">₹{p.price}</h3>
          <img src={p.image} className="w-24" alt="" />
          <button
            onClick={() => purchase(p.id)}
            className="p-1 bg-amber-600 mx-auto w-full block"
          >
            Buy
          </button>
        </div>
      ))}

      <Link href="/login">Login</Link>
      <Link href="/signup">Signup</Link>
    </div>
  );
}
async function purchase(productId) {
  const token = localStorage.getItem("access");

  const res = await axios.post(
    "http://localhost:8000/api/create-order/",
    { product_id: productId },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const options = {
    key: res.data.key,
    amount: res.data.amount,
    order_id: res.data.order_id,
    handler: async function (response) {
      await axios.post(
        "http://localhost:8000/api/verify-payment/",
        response,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Payment Successful!");
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
