"use client";

import { useWishlist } from "@/components/context/WishlistContext";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();

  if (loading) return <div className="p-10">Loading...</div>;

  if (wishlistItems.length === 0) {
    return <div className="p-10 text-gray-500">Wishlist is empty</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded p-4 flex gap-4"
          >
            <img
              src={item.image1}
              alt={item.title}
              width={120}
              height={120}
              className="rounded"
            />

            <div className="flex-1">
              <Link href={`/products/${item.slug}`}>
                <h2 className="font-semibold text-lg hover:underline text-black">
                  {item.title}
                </h2>
              </Link>
              <p className="text-green-600 font-bold">₹ {item.price}</p>

              <button
                onClick={() => removeFromWishlist(item.slug)}
                className="mt-2 text-sm text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
