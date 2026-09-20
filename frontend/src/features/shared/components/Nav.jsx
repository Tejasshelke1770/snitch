import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import useCart from "../../cart/hook/useCart";
import { useAuth } from "../../auth/hook/useAuth";

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems } = useCart();
  const { user } = useAuth();

  // Safely compute total items in bag
  const cartLength = Array.isArray(cartItems)
    ? cartItems.reduce((acc, curr) => acc + (Number(curr?.quantity) || 1), 0)
    : 0;

  // Route context detection
  const pathname = location.pathname;
  const isCart = pathname === "/cart";
  const isSeller = pathname.startsWith("/seller");
  const isSellerDashboard = pathname === "/seller/dashboard";
  const isSellerCreate = pathname === "/seller/create-products";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer upon route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* ================================================================ */}
        {/* LEFT CLUSTER: BRAND LOGO + CONTEXT PILL */}
        {/* ================================================================ */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Snitch Wordmark Anchor */}
          <Link to="/" className="group flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-white group-hover:text-amber-400 transition-colors uppercase">
              SNITCH
            </span>
          </Link>
        </div>

        {/* ================================================================ */}
        {/* CENTER CLUSTER: SELLER TABS (if on seller routes) */}
        {/* ================================================================ */}
        <div className="flex-1 flex justify-center max-w-xl mx-auto">
          {isSeller && (
            <nav className="hidden md:flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
              <Link
                to="/seller/dashboard"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSellerDashboard
                    ? "bg-amber-400 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/seller/create-products"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSellerCreate
                    ? "bg-amber-400 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <span>+ Add Piece</span>
              </Link>
            </nav>
          )}
        </div>

        {/* ================================================================ */}
        {/* RIGHT CLUSTER: SELLER SWITCHER + BAG TRIGGER + AUTH */}
        {/* ================================================================ */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isSeller && user?.role === 'seller' && (
            <Link
              to="/seller/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-amber-500/20 text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 text-xs font-medium transition-all shadow-sm"
              title="Enter Seller Atelier Studio"
            >
              <svg
                className="w-3.5 h-3.5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="hidden md:inline">Seller Atelier</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </Link>
          )}

          {/* View Storefront Link (if inside seller portal) */}
          {isSeller && (
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-300 text-xs font-medium transition-all"
              title="Preview Customer Storefront"
            >
              <svg
                className="w-3.5 h-3.5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="hidden md:inline">View Store</span>
            </Link>
          )}

          {/* Shopping Bag Trigger Button */}
          {user && <button
            type="button"
            id="header-bag-trigger"
            onClick={() => navigate("/cart")}
            aria-label="Open Shopping Bag"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              isCart
                ? "bg-amber-400/10 border border-amber-400 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                : "bg-zinc-900 border border-amber-500/30 hover:border-amber-400 text-zinc-200 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]"
            }`}
          >
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-xs font-semibold hidden sm:inline">Bag</span>
            <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center justify-center">
              {cartLength}
            </span>
          </button>}

          {/* User Profile or Sign In Link */}
          {user ? (
            <div className="flex items-center gap-2">
              <span
                title={user.fullname || user.email}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center cursor-default shadow-sm font-mono"
              >
                {(user.fullname?.[0] || user.email?.[0] || "U").toUpperCase()}
              </span>
              {user.role === "seller" && (
                <span className="hidden xl:inline text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  SELLER
                </span>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-all"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white md:hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MOBILE EXPANDABLE DRAWER */}
      {/* ================================================================ */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-zinc-800/80 bg-[#09090b]/98 backdrop-blur-2xl space-y-3 animate-in fade-in duration-150">
          {/* Mobile Navigation Links */}
          <div className="flex flex-col gap-2 pt-1 text-xs font-semibold">
            {isSeller ? (
              <>
                <Link
                  to="/seller/dashboard"
                  className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                    isSellerDashboard
                      ? "bg-amber-400 text-zinc-950 font-bold"
                      : "text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <span>Dashboard</span>
                  <span className="font-mono text-[10px]">Overview</span>
                </Link>
                <Link
                  to="/seller/create-products"
                  className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                    isSellerCreate
                      ? "bg-amber-400 text-zinc-950 font-bold"
                      : "text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <span>+ Create Product</span>
                  <span className="font-mono text-[10px]">New Piece</span>
                </Link>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 flex items-center justify-between"
                >
                  <span>Public Storefront</span>
                  <span className="font-mono text-[10px]">Preview</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center justify-between"
                >
                  <span>Catalog &amp; Drops</span>
                  <span className="font-mono text-[10px]">Shop</span>
                </Link>
                <Link
                  to="/seller/dashboard"
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-amber-500/20 text-amber-300 flex items-center justify-between"
                >
                  <span>Seller Atelier Studio</span>
                  <span className="font-mono text-[10px]">Portal</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Nav;
