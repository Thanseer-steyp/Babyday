import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

export default function Header() {
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
      </div>
    </header>
  );
}
