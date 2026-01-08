"use client"
import Link from "next/link";
import { useState,useEffect } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, ShoppingCart,Search } from "lucide-react";
import { useAuth } from "../../../components/context/AuthContext";
import AuthModal from "../../../components/includes/AuthModal";

export default function Header() {
  const { user, logout } = useAuth();
  const [openAuth, setOpenAuth] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();
  const boxRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
  
    const delay = setTimeout(() => {
      axios
        .get(`http://localhost:8000/api/v1/public/products/`, {
          params: {
            q: q,
            limit: 6,
          },
        })
        .then((res) => {
          setResults(res.data);
          setShowDropdown(true);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setResults([]);
          setShowDropdown(false);
        });
    }, 300); // debounce
  
    return () => clearTimeout(delay);
  }, [q]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setShowDropdown(false);
  };
  return (
    <header className="bg-white shadow-md relative z-50">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold text-green-600 cursor-pointer">
            MyShop
          </h1>
        </Link>

        <div className="relative w-full max-w-md" ref={boxRef}>
          <form
            onSubmit={handleSubmit}
            className="flex items-center border rounded-lg px-3 py-1"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="flex-1 outline-none text-sm text-black"
              onFocus={() => results.length && setShowDropdown(true)}
            />
            <button type="submit">
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          </form>

          {/* 🔽 Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100"
                >
                  <img
                    src={item.image1}
                    alt={item.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm text-black">{item.title}</p>
                    <p className="text-xs text-green-600">₹{item.price}</p>
                  </div>
                </Link>
              ))}

              {/* View all */}
              <button
                onClick={() => router.push(`/products?q=${q}`)}
                className="w-full text-center text-sm py-2 text-green-600 hover:bg-gray-50"
              >
                View all results →
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/products"
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Products
          </Link>
          <Link
            href="/admin"
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Admin
          </Link>
          <Link
            href="/orders"
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Orders
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Link href="/wishlist" className="relative">
            <Heart className="w-6 h-6 text-gray-700 hover:text-red-500" />
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-green-600" />
          </Link>
        </div>
        {user ? (
          <div className="">
            <h4 className="font-medium capitalize text-black  text-center">
              {user.username}
            </h4>

            <div className="shadow rounded">
              <button
                onClick={logout}
                className="px-4 py-2 w-full text-left hover:bg-gray-100 text-black border-black"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpenAuth(true)}
            className="px-4 py-2 shadow rounded text-left hover:bg-gray-100 text-black border-black"
          >
            Login
          </button>
        )}
      </div>
      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        onSuccess={() => {}}
      />
    </header>
  );
}
