"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access) setToken(access);
    else setLoading(false);
  }, []);

  const fetchWishlist = async (authToken) => {
    if (!authToken) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/wishlist/",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setWishlistItems(res.data);
    } catch {
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWishlist(token);
  }, [token]);

  const addToWishlist = async (slug) => {
    if (!token) throw new Error("Not logged in");

    await axios.post(
      `http://localhost:8000/api/v1/user/wishlist/add/${slug}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchWishlist(token);
  };

  const removeFromWishlist = async (slug) => {
    if (!token) return;

    await axios.delete(
      `http://localhost:8000/api/v1/user/wishlist/remove/${slug}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchWishlist(token);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        addToWishlist,
        removeFromWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
