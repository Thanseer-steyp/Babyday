"use client";

import { useState } from "react";
import api from "@/components/config/Api";

export default function StarRating({ orderId, onRated }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRating = async () => {
    if (!rating) return;

    try {
      setLoading(true);
      await api.post(`api/v1/user/orders/${orderId}/rate/`, {
        rating,
        review,
      });
      onRated();
    } catch {
      alert("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* ⭐ Stars */}
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <span
              className={`text-2xl ${
                star <= (hover || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          </button>
        ))}
      </div>

      {/* 📝 Review box (shows only after rating selected) */}
      {rating > 0 && (
        <>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write a short review (optional)"
            className="w-full border rounded p-2 text-sm"
            rows={2}
          />

          <button
            disabled={loading}
            onClick={submitRating}
            className="px-4 py-1 text-sm bg-black text-white rounded w-full"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </>
      )}
    </div>
  );
}
