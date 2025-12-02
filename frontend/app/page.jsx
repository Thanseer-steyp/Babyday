// "use client";
// import { useEffect, useState } from "react";
// import axiosInstance from "@/components/config/AxiosInstance";

// export default function Products() {
//   const [cloth, setCloth] = useState([]);
//   const [jewellery, setJewellery] = useState([]);

//   // Load Razorpay SDK
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     document.body.appendChild(script);
//   }, []);

//   // Load products from both categories
//   useEffect(() => {
//     axiosInstance
//       .get("user/cloth/")
//       .then((res) => setCloth(res.data))
//       .catch(console.error);

//     axiosInstance
//       .get("user/jewellery/")
//       .then((res) => setJewellery(res.data))
//       .catch(console.error);
//   }, []);

//   return (
//     <div className="p-4">
//       <h1 className="text-center text-2xl font-bold mb-6">Our Products</h1>

//       {/* Clothes */}
//       <CategorySection
//         title="Clothes"
//         products={cloth}
//         productType="cloth"
//       />

//       {/* Jewellery */}
//       <CategorySection
//         title="Jewellery"
//         products={jewellery}
//         productType="jewellery"
//       />
//     </div>
//   );
// }

// // -----------------------------------------------------
// // REUSABLE CATEGORY COMPONENT
// // -----------------------------------------------------
// function CategorySection({ title, products, productType }) {
//   return (
//     <div className="mb-10">
//       <h2 className="text-xl font-semibold mb-4">{title}</h2>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {products.map((p) => (
//           <ProductCard product={p} productType={productType} key={`${productType}-${p.id}`} />
//         ))}
//       </div>
//     </div>
//   );
// }

// // -----------------------------------------------------
// // PRODUCT CARD
// // -----------------------------------------------------
// function ProductCard({ product, productType }) {
//   return (
//     <div className="p-3 bg-amber-100 rounded shadow border">
//       <h3 className="text-lg font-bold text-center text-black">{product.name}</h3>
//       <h4 className="text-center text-black">₹{product.price}</h4>

//       <img src={product.image} alt="" className="w-full h-32 object-contain my-2" />

//       <button
//         onClick={() => purchase(productType, product.id)}
//         className="w-full bg-amber-600 text-white py-2 rounded mt-2"
//       >
//         Buy Now
//       </button>
//     </div>
//   );
// }

// // -----------------------------------------------------
// // PAYMENT FUNCTION
// // -----------------------------------------------------
// async function purchase(productType, productId) {
//   const token = localStorage.getItem("access");

//   try {
//     // Creating Razorpay order
//     const res = await axiosInstance.post(
//       "user/create-order/",
//       {
//         product_type: productType,
//         product_id: productId,
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     // Razorpay options
//     const options = {
//       key: res.data.key,
//       amount: res.data.amount,
//       currency: "INR",
//       order_id: res.data.order_id,
//       name: `BabyDay - ${res.data.product}`,
//       description: `Purchase of ${res.data.product}`,
      

//       handler: async function (response) {
//         await axiosInstance.post(
//           "user/verify-payment/",
//           response,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         alert("Payment Successful!");
//       },

//       theme: { color: "#F59E0B" },
//     };

//     if (!window.Razorpay) {
//       alert("Razorpay SDK failed to load.");
//       return;
//     }

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   } catch (error) {
//     console.error(error);
//     alert("Something went wrong during purchase");
//   }
// }



import Home from "@/app/product/page"

function page() {
  return (
    <div>
      <Home />
    </div>
  )
}

export default page

