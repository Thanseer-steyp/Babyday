import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "../../../components/context/AuthContext";
import AuthModal from "../../../components/includes/AuthModal";

export default function Header() {
  const { user, logout } = useAuth();
  const [openAuth, setOpenAuth] = useState(false);
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold text-green-600 cursor-pointer">
            MyShop
          </h1>
        </Link>

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
            href="/contact"
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Contact
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
