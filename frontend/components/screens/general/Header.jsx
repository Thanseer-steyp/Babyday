"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, ShoppingCart, Search, Menu, X, LogOut, Package, Settings, ShoppingBag } from "lucide-react";
import { useAuth } from "../../../components/context/AuthContext";
import AuthModal from "../../../components/includes/AuthModal";

export default function Header() {
  const { user, logout } = useAuth();
  const [openAuth, setOpenAuth] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const boxRef = useRef(null);

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── search debounce ── */
  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const delay = setTimeout(() => {
      axios
        .get(`http://localhost:8000/api/v1/public/products/`, { params: { q, limit: 6 } })
        .then((res) => { setResults(res.data); setShowDropdown(true); })
        .catch(() => { setResults([]); setShowDropdown(false); });
    }, 300);
    return () => clearTimeout(delay);
  }, [q]);

  /* ── click outside search ── */
  useEffect(() => {
    const fn = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setShowDropdown(false);
  };

  const navLinks = [
    { href: "/products", label: "Products", icon: "🧸" },
    { href: "/admin",    label: "Admin",    icon: "⚙️" },
    { href: "/orders",   label: "Orders",   icon: "📦" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .kh-header {
          font-family: 'Nunito', system-ui, sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fff;
          border-bottom: 2.5px solid #fce7f3;
          transition: box-shadow 0.2s;
        }
        .kh-header.scrolled {
          box-shadow: 0 4px 24px rgba(249,168,212,0.18);
        }

        /* rainbow top stripe */
        .kh-stripe {
          height: 4px;
          background: linear-gradient(90deg, #f9a8d4, #a78bfa, #67e8f9, #86efac, #fde68a, #f9a8d4);
          background-size: 300% 100%;
          animation: kh-rainbow 4s linear infinite;
        }
        @keyframes kh-rainbow { 0%{background-position:0%} 100%{background-position:300%} }

        .kh-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* ── Logo ── */
        .kh-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .kh-logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #f9a8d4, #a78bfa);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(167,139,250,0.3);
          transition: transform 0.2s;
        }
        .kh-logo:hover .kh-logo-icon { transform: rotate(10deg) scale(1.1); }
        .kh-logo-text {
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(90deg, #ec4899, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .kh-logo-sub {
          font-size: 10px;
          font-weight: 700;
          color: #a78bfa;
          letter-spacing: 0.5px;
          line-height: 1;
        }

        /* ── Search ── */
        .kh-search-wrap {
          flex: 1;
          max-width: 420px;
          position: relative;
        }
        .kh-search-form {
          display: flex;
          align-items: center;
          background: #faf5ff;
          border: 2px solid #e9d5ff;
          border-radius: 50px;
          padding: 8px 14px;
          gap: 8px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .kh-search-form:focus-within {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
          background: #fff;
        }
        .kh-search-form input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          font-weight: 600;
          color: #1e1b4b;
          font-family: inherit;
        }
        .kh-search-form input::placeholder { color: #c4b5fd; font-weight: 600; }
        .kh-search-btn {
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .kh-search-btn:hover { transform: scale(1.1); }

        /* dropdown */
        .kh-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0; right: 0;
          background: #fff;
          border: 2px solid #e9d5ff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.12);
          overflow: hidden;
        }
        .kh-drop-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          text-decoration: none;
          transition: background 0.15s;
          cursor: pointer;
        }
        .kh-drop-item:hover { background: #faf5ff; }
        .kh-drop-img {
          width: 40px; height: 40px;
          object-fit: cover;
          border-radius: 10px;
          border: 1.5px solid #e9d5ff;
          flex-shrink: 0;
        }
        .kh-drop-title { font-size: 13px; font-weight: 700; color: #1e1b4b; }
        .kh-drop-price { font-size: 12px; font-weight: 800; color: #059669; }
        .kh-drop-viewall {
          display: block;
          width: 100%;
          text-align: center;
          padding: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #7c3aed;
          background: #faf5ff;
          border: none;
          border-top: 1.5px solid #e9d5ff;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .kh-drop-viewall:hover { background: #f3e8ff; }

        /* ── Nav links ── */
        .kh-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .kh-nav-link {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 50px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          color: #6b7280;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .kh-nav-link:hover {
          background: #faf5ff;
          color: #7c3aed;
        }
        .kh-nav-link .emoji { font-size: 14px; }

        /* ── Icons ── */
        .kh-icons {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .kh-icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          background: transparent;
          border: 2px solid transparent;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          cursor: pointer;
        }
        .kh-icon-btn:hover {
          background: #fff0f8;
          border-color: #f9a8d4;
          transform: scale(1.1);
        }
        .kh-icon-btn.cart:hover {
          background: #f0fdf4;
          border-color: #86efac;
        }

        /* ── User area ── */
        .kh-user {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .kh-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f9a8d4, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(167,139,250,0.3);
        }
        .kh-username {
          font-size: 13px;
          font-weight: 800;
          color: #1e1b4b;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kh-logout-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: #fff0f8;
          border: 2px solid #f9a8d4;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          color: #be185d;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .kh-logout-btn:hover { background: #fce7f3; }
        .kh-login-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: linear-gradient(90deg, #ec4899, #a78bfa);
          border: none;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 3px 12px rgba(167,139,250,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .kh-login-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 18px rgba(167,139,250,0.4);
        }

        /* ── Mobile menu btn ── */
        .kh-hamburger {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #faf5ff;
          border: 2px solid #e9d5ff;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .kh-hamburger:hover { background: #f3e8ff; }

        /* ── Mobile drawer ── */
        .kh-mobile-drawer {
          display: none;
          flex-direction: column;
          padding: 16px 20px 20px;
          border-top: 2px solid #fce7f3;
          background: #fff;
          gap: 8px;
        }
        .kh-mobile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 14px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          color: #4b5563;
          background: #faf5ff;
          transition: background 0.15s, color 0.15s;
        }
        .kh-mobile-link:hover { background: #f3e8ff; color: #7c3aed; }

        @media (max-width: 768px) {
          .kh-nav { display: none; }
          .kh-hamburger { display: flex; }
          .kh-mobile-drawer.open { display: flex; }
          .kh-username { display: none; }
        }
        @media (max-width: 520px) {
          .kh-search-wrap { max-width: 160px; }
        }
      `}</style>

      <header className={`kh-header${scrolled ? " scrolled" : ""}`}>
        <div className="kh-stripe" />

        <div className="kh-inner">
          {/* ── Logo ── */}
          <Link href="/" className="kh-logo">
            <div className="kh-logo-icon">🧸</div>
            <div>
              <div className="kh-logo-text">TinyTrends</div>
              <div className="kh-logo-sub">For little ones 💕</div>
            </div>
          </Link>

          {/* ── Search ── */}
          <div className="kh-search-wrap" ref={boxRef}>
            <form onSubmit={handleSubmit} className="kh-search-form">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cute stuff…"
                onFocus={() => results.length && setShowDropdown(true)}
              />
              <button type="submit" className="kh-search-btn">
                <Search style={{ width: 14, height: 14, color: "#fff" }} />
              </button>
            </form>

            {showDropdown && results.length > 0 && (
              <div className="kh-dropdown">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={() => setShowDropdown(false)}
                    className="kh-drop-item"
                  >
                    <img src={item.image1} alt={item.title} className="kh-drop-img" />
                    <div>
                      <div className="kh-drop-title">{item.title}</div>
                      <div className="kh-drop-price">₹{item.price}</div>
                    </div>
                  </Link>
                ))}
                <button
                  className="kh-drop-viewall"
                  onClick={() => { router.push(`/products?q=${q}`); setShowDropdown(false); }}
                >
                  See all results for "{q}" →
                </button>
              </div>
            )}
          </div>

          {/* ── Nav links ── */}
          <nav className="kh-nav">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="kh-nav-link">
                <span className="emoji">{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* ── Icons ── */}
          <div className="kh-icons">
            <Link href="/wishlist" className="kh-icon-btn">
              <Heart style={{ width: 18, height: 18, color: "#ec4899" }} />
            </Link>
            <Link href="/cart" className="kh-icon-btn cart">
              <ShoppingCart style={{ width: 18, height: 18, color: "#059669" }} />
            </Link>
          </div>

          {/* ── User / Auth ── */}
          {user ? (
            <div className="kh-user">
              <div className="kh-avatar">
                {user.username?.[0]?.toUpperCase() || "👶"}
              </div>
              <span className="kh-username">{user.username}</span>
              <button className="kh-logout-btn" onClick={logout}>
                <LogOut style={{ width: 13, height: 13 }} />
                Logout
              </button>
            </div>
          ) : (
            <button className="kh-login-btn" onClick={() => setOpenAuth(true)}>
              👋 Login
            </button>
          )}

          {/* ── Hamburger ── */}
          <button
            className="kh-hamburger"
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            {mobileMenuOpen
              ? <X style={{ width: 18, height: 18, color: "#7c3aed" }} />
              : <Menu style={{ width: 18, height: 18, color: "#7c3aed" }} />
            }
          </button>
        </div>

        {/* ── Mobile drawer ── */}
        <div className={`kh-mobile-drawer${mobileMenuOpen ? " open" : ""}`}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="kh-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={{ fontSize: 18 }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
          <Link href="/wishlist" className="kh-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <Heart style={{ width: 16, height: 16, color: "#ec4899" }} /> Wishlist
          </Link>
          <Link href="/cart" className="kh-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart style={{ width: 16, height: 16, color: "#059669" }} /> Cart
          </Link>
          {!user && (
            <button
              className="kh-login-btn"
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
              onClick={() => { setOpenAuth(true); setMobileMenuOpen(false); }}
            >
              👋 Login / Sign up
            </button>
          )}
        </div>
      </header>

      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        onSuccess={() => {}}
      />
    </>
  );
}