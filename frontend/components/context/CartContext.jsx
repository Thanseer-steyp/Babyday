"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token
  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  // Fetch cart from backend
  const fetchCart = async (authToken) => {
    if (!authToken) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/cart/", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setCartItems(res.data);
    } catch (err) {
      console.error("Cart fetch failed");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart when token changes
  useEffect(() => {
    if (token) {
      fetchCart(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const addToCart = async (slug, size) => {
    if (!token) throw new Error("Not authenticated");

    await axios.post(
      `http://localhost:8000/api/v1/user/cart/add/${slug}/`,
      { size }, // send size
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchCart(token); // refresh cart
  };

  // Remove from cart
  const removeFromCart = async (slug) => {
    if (!token) return;

    await axios.delete(
      `http://localhost:8000/api/v1/user/cart/remove/${slug}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchCart(token);
  };

  const updateQty = async (slug, action) => {
    if (!token) return;

    await axios.patch(
      `http://localhost:8000/api/v1/user/cart/update/${slug}/`,
      { action }, // "increase" | "decrease"
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchCart(token);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),

        addToCart,
        removeFromCart,
        updateQty,
        loading,
        token,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => useContext(CartContext);
