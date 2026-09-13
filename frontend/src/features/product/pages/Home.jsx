import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import useProduct from "../hook/useProduct";
import { useAuth } from "../../auth/hook/useAuth";

// Helper to safely extract image URL whether object or string
const extractImageUrl = (img) => {
  if (!img)
    return "https://ik.imagekit.io/0etg1a8vc/snitch/51c-J0lt7KL._AC_SR480_440__dRAJAT-HK.jpg";
  if (typeof img === "string") return img;
  return (
    img.url ||
    "https://ik.imagekit.io/0etg1a8vc/snitch/51c-J0lt7KL._AC_SR480_440__dRAJAT-HK.jpg"
  );
};

const Home = () => {
  const { handleGetAllProducts, AllProducts = [], error, loading, } = useProduct();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search, Filter & Sorter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Shopping Bag State
  const [cartItems, setCartItems] = useState([]);
  const [isBagOpen, setIsBagOpen] = useState(false);

  // Wishlist State (Set of Product IDs)
  const [wishlist, setWishlist] = useState(new Set());

  // Toast message feedback
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K focuses search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("store-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show quick toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Combine Redux products with fallback products if Redux has none
  const displayProducts = useMemo(() => {
    if (Array.isArray(AllProducts) && AllProducts.length > 0) {
      return AllProducts;
    }
    return [];
  }, [AllProducts]);

  // Filter and Sort products
  const filteredProducts = useMemo(() => {
    return displayProducts
      .filter((product) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (product.title || "").toLowerCase().includes(q);
          const matchDesc = (product.description || "")
            .toLowerCase()
            .includes(q);
          const matchSeller = (product.seller || "").toLowerCase().includes(q);
          const amount = product.price?.amount ?? product.price ?? "";
          const matchPrice = amount.toString().includes(q);
          if (!matchTitle && !matchDesc && !matchSeller && !matchPrice) {
            return false;
          }
        }

        const numericPrice = Number(
          product.price?.amount ?? product.price ?? 0,
        );

        // Category filter
        if (activeCategory === "under500") {
          if (numericPrice > 500) return false;
        } else if (activeCategory === "under1000") {
          if (numericPrice > 1000) return false;
        } else if (activeCategory === "luxury") {
          if (numericPrice < 500) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = Number(a.price?.amount ?? a.price ?? 0);
        const priceB = Number(b.price?.amount ?? b.price ?? 0);

        if (sortBy === "price-low") {
          return priceA - priceB;
        }
        if (sortBy === "price-high") {
          return priceB - priceA;
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }
        // Default: featured
        return 0;
      });
  }, [displayProducts, searchQuery, activeCategory, sortBy]);

  // Add to Bag Handler
  const handleAddToBag = (product, size = "M", e) => {
    if (e) e.stopPropagation();
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id && item.size === size,
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    showToast(`Added "${product.title || "Item"}" to Bag`);
  };

  // Remove from Bag
  const handleRemoveFromBag = (productId, size) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product._id === productId && item.size === size),
      ),
    );
  };

  // Adjust quantity
  const handleUpdateQuantity = (productId, size, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  // Toggle Wishlist
  const toggleWishlist = (productId, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast("Removed from wishlist");
      } else {
        next.add(productId);
        showToast("Saved to wishlist");
      }
      return next;
    });
  };

  // Currency formatter
  const formatINR = (val) => {
    const num = Number(val?.amount ?? val ?? 0);
    if (isNaN(num)) return "₹0";
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Total Bag Count and Price
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const totalCartPrice = cartItems.reduce(
    (acc, item) =>
      acc +
      Number(item.product.price?.amount ?? item.product.price ?? 0) *
        item.quantity,
    0,
  );

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4efe6] font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 flex flex-col relative">
      {/* Warm Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/3 w-[36rem] h-[36rem] bg-amber-500/[0.04] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-amber-600/[0.03] rounded-full blur-[140px]" />
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900/95 border border-amber-500/30 text-amber-300 text-xs font-medium shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <svg
            className="w-4 h-4 text-amber-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STICKY LUXURY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/90 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Anchor */}
          <div className="flex items-center gap-6">
            <Link to="/" className="group flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-white group-hover:text-amber-400 transition-colors uppercase">
                SNITCH
              </span>
            </Link>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <svg
                className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="store-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archive, cut, fabric, seller..."
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-full pl-9 pr-14 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
                </button>
              ) : (
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 border border-zinc-700/60 rounded px-1.5 py-0.5 bg-zinc-800/80">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Atelier Seller Portal Link */}
            <Link
              to="/seller/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-amber-500/20 text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 text-xs font-medium transition-all"
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
              <span className="hidden sm:inline">Seller Atelier</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </Link>

            {/* Auth Link (Sign In or User Initial) */}
            {user ? (
              <span
                title={user.email || user.fullname}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center cursor-default"
              >
                {(user.fullname?.[0] || user.email?.[0] || "U").toUpperCase()}
              </span>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() =>
                showToast(`${wishlist.size} saved items in wishlist`)
              }
              aria-label="Saved items"
              className="relative p-2 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/30 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill={wishlist.size > 0 ? "#f59e0b" : "none"}
                stroke={wishlist.size > 0 ? "#f59e0b" : "currentColor"}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlist.size > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 font-bold text-[9px] flex items-center justify-center">
                  {wishlist.size}
                </span>
              )}
            </button>

            {/* Bag Button */}
            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              aria-label="Shopping Bag"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/30 hover:border-amber-400 text-zinc-200 transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] cursor-pointer"
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
              <span className="text-xs font-semibold hidden sm:inline">
                Bag
              </span>
              <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center justify-center">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION: AUREATE OBSIDIAN CAPSULE RELEASE */}
      <section className="relative z-10 overflow-hidden bg-[#070709] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Release Pill */}
              <div className="inline-flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-amber-500/30 font-mono text-[11px] text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  AUTUMN / WINTER 2026 DROP
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Limited Batch Edition</span>
                </span>
              </div>

              {/* Headlines */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  AUREATE{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                    OBSIDIAN
                  </span>
                </h1>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Architectural silhouettes forged with high-density textiles,
                  antiqued brass hardware, and minimalist streetwear tailoring.
                  Built for the modern vanguard.
                </p>
              </div>

              {/* Atelier Spec Matrix */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-zinc-800/80 max-w-lg">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    FABRIC MATRIX
                  </div>
                  <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">
                    480 GSM
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    CURRENCY
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-zinc-200 mt-0.5">
                    INR (₹)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    STATUS
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-amber-300 mt-0.5">
                    Active Catalog
                  </div>
                </div>
              </div>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("catalog-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.45)] flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                <Link
                  to="/seller/dashboard"
                  className="px-5 py-3 rounded-xl bg-zinc-900 border border-amber-500/20 hover:border-amber-400/50 text-amber-300 font-semibold text-xs tracking-wide transition-all hover:bg-zinc-800"
                >
                  Seller Matrix Hub &rarr;
                </Link>
              </div>

              {/* Authenticity Badge */}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <svg
                  className="w-4 h-4 text-amber-400/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>
                  Live seller inventory verified directly via Snitch API engine.
                </span>
              </div>
            </div>

            {/* Right Hero Image Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto rounded-2xl overflow-hidden border border-amber-500/20 bg-zinc-900 shadow-2xl group">
                <div className="aspect-[4/4.5] w-full overflow-hidden bg-zinc-950">
                  <img
                    alt="SNITCH Aureate Obsidian Showcase"
                    src="https://ik.imagekit.io/0etg1a8vc/snitch/51c-J0lt7KL._AC_SR480_440__dRAJAT-HK.jpg"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95 contrast-105"
                  />
                </div>

                {/* Floating Product Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-zinc-900/85 border border-amber-500/25 backdrop-blur-md flex items-center justify-between shadow-xl">
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                      CAPSULE EDITORIAL DROP
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      Structured Overshirt & Canvas Fit
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-amber-400">
                      ₹111 INR
                    </span>
                  </div>
                </div>

                {/* Corner Ambient Glow */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISCOVERY & FILTER TOOLBAR */}
      <section
        id="catalog-section"
        className="sticky top-[69px] z-30 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/90 py-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              All Pieces ({displayProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("under500")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "under500"
                  ? "bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              Under ₹500
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("under1000")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "under1000"
                  ? "bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              Under ₹1,000
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("luxury")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "luxury"
                  ? "bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              Premium Tiers
            </button>
          </div>

          {/* Sorter & Stock Toggle */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4 text-xs">
            {/* Live Counter */}
            <span className="text-zinc-500 font-mono hidden sm:inline">
              Showing{" "}
              <strong className="text-amber-400">
                {filteredProducts.length}
              </strong>{" "}
              {filteredProducts.length === 1 ? "piece" : "pieces"}
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-amber-400 font-semibold p-0 pr-4 focus:ring-0 text-xs cursor-pointer"
              >
                <option value="featured" className="bg-zinc-900 text-zinc-200">
                  Featured Release
                </option>
                <option value="price-low" className="bg-zinc-900 text-zinc-200">
                  Price: Low to High
                </option>
                <option
                  value="price-high"
                  className="bg-zinc-900 text-zinc-200"
                >
                  Price: High to Low
                </option>
                <option value="newest" className="bg-zinc-900 text-zinc-200">
                  Newest Drop
                </option>
                <option value="title" className="bg-zinc-900 text-zinc-200">
                  Alphabetical
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CATALOG DISPLAY */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Catalog Sync Error Banner */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-amber-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error} - Displaying cached atelier drop.</span>
            </div>
            <button
              type="button"
              onClick={() => handleGetAllProducts()}
              className="px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-semibold text-xs transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 font-mono">
              Loading inventory...
            </span>
          </div>
        )}

        {/* Empty Search / Filter Results */}
        {!loading && filteredProducts.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <svg
              className="w-12 h-12 text-zinc-600 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-base font-semibold text-zinc-200">
              No pieces found
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search keyword or clearing the active category
              filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs transition-colors hover:bg-amber-300"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                formatINR={formatINR}
                isWishlisted={wishlist.has(product._id)}
                onToggleWishlist={(e) => toggleWishlist(product._id, e)}
                onAddToBag={(e) => handleAddToBag(product, "M", e)}
                openProductDetails={() => navigate(`/product/${product._id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* SLIDE-OUT SHOPPING BAG DRAWER */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-y-0 right-0 max-w-full flex pl-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-screen max-w-md bg-[#0e0e12] border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl">
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">
                      Your Atelier Bag ({totalCartCount})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBagOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-zinc-800/80 max-h-[55vh] overflow-y-auto mt-4 pr-1">
                  {cartItems.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500 text-xs">
                      <svg
                        className="w-12 h-12 text-zinc-700 mx-auto mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span>Your shopping bag is empty.</span>
                    </div>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div
                        key={`${item.product._id}-${item.size}-${idx}`}
                        className="py-4 flex gap-3.5 items-center"
                      >
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                          <img
                            src={extractImageUrl(item.product.images?.[0])}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.product.title}
                          </h4>
                          <span className="text-[11px] text-zinc-500 font-mono block">
                            Size: {item.size} • {formatINR(item.product.price)}
                          </span>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product._id,
                                  item.size,
                                  -1,
                                )
                              }
                              className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold hover:bg-zinc-700"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono text-white px-1">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product._id,
                                  item.size,
                                  1,
                                )
                              }
                              className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold hover:bg-zinc-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-amber-400">
                            {formatINR(
                              Number(
                                item.product.price?.amount ??
                                  item.product.price ??
                                  0,
                              ) * item.quantity,
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveFromBag(item.product._id, item.size)
                            }
                            className="text-[10px] text-zinc-500 hover:text-rose-400 mt-2 block"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Drawer Footer / Subtotal & Checkout */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">SUBTOTAL</span>
                  <span className="text-sm font-bold text-amber-400">
                    {formatINR(totalCartPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono">
                  <span>INSURED COURIER FREIGHT</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <button
                  type="button"
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    showToast("Order reservation preview generated!");
                    setIsBagOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  Proceed to Checkout
                </button>
                <p className="text-[10px] text-center text-zinc-500 font-mono">
                  End-to-end encrypted checkout • Snitch Atelier Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LUXURY FOOTER */}
      <footer className="relative z-10 bg-[#060608] border-t border-zinc-800/80 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <span className="text-xl font-black tracking-[0.25em] text-white uppercase block">
                SNITCH
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Haute couture streetwear division. Engineered for architectural
                silhouettes, heavy combed fibers, and refined rebellion.
              </p>
              <div className="text-[11px] font-mono text-amber-400/90">
                Aureate Obsidian Edition
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-3">
                COLLECTIONS
              </h5>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a
                    href="#catalog-section"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Autumn / Winter Drop
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog-section"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Heavyweight Overshirts
                  </a>
                </li>
                <li>
                  <a
                    href="#catalog-section"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Luxury Essentials
                  </a>
                </li>
              </ul>
            </div>

            {/* Seller & Platform */}
            <div>
              <h5 className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-3">
                SELLER ATELIER
              </h5>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <Link
                    to="/seller/dashboard"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Seller Product Matrix
                  </Link>
                </li>
                <li>
                  <Link
                    to="/seller/create-products"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Publish New Drop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Atelier Member Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-3">
                EXCLUSIVE ACCESS
              </h5>
              <p className="text-xs text-zinc-400 mb-3">
                Receive secret access codes for upcoming capsule releases before
                public drops.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast("Subscribed to Atelier secret access list!");
                }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter email..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px] font-mono">
            <div>
              © 2026 SNITCH / AUREATE OBSIDIAN ATELIER. ALL RIGHTS RESERVED.
            </div>
            <div className="flex items-center gap-4">
              <span className="hover:text-zinc-300 cursor-pointer">
                PRIVACY POLICY
              </span>
              <span>•</span>
              <span className="hover:text-zinc-300 cursor-pointer">
                TERMS OF SERVICE
              </span>
              <span>•</span>
              <span className="hover:text-zinc-300 cursor-pointer">
                VERIFICATION SPEC
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Subcomponent: Individual Luxury Product Card
const ProductCard = ({
  product,
  formatINR,
  isWishlisted,
  onToggleWishlist,
  onAddToBag,
  openProductDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [
          {
            url: "https://ik.imagekit.io/0etg1a8vc/snitch/51c-J0lt7KL._AC_SR480_440__dRAJAT-HK.jpg",
          },
        ];

  const currentImgUrl = extractImageUrl(images[currentImageIndex] || images[0]);
  const amount = product.price?.amount ?? product.price ?? 0;

  return (
    <article className="group rounded-2xl overflow-hidden bg-[#121216] border border-zinc-800/80 hover:border-amber-400/50 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative">
      {/* Top Floating Status Badges */}
      <div className="p-3 absolute top-0 left-0 right-0 z-20 flex justify-between items-center pointer-events-none">
        <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono font-semibold text-amber-400">
          {Number(amount) < 500 ? "Active Drop" : "Executive"}
        </span>
        <button
          type="button"
          onClick={onToggleWishlist}
          title="Save to Wishlist"
          className="pointer-events-auto p-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 hover:border-amber-400/40 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5"
            fill={isWishlisted ? "#f59e0b" : "none"}
            stroke={isWishlisted ? "#f59e0b" : "currentColor"}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Product Image Frame */}
      <div
        className="relative aspect-[4/4.5] bg-zinc-950 overflow-hidden cursor-pointer"
        onClick={() => openProductDetails()}
        onMouseEnter={() => {
          if (images.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <img
          alt={product.title || "Garment"}
          src={currentImgUrl}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 contrast-105"
        />

        {/* Multi-Image Indicator Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center gap-1 pointer-events-none">
            {images.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImageIndex === dotIdx
                    ? "bg-amber-400 w-3"
                    : "bg-zinc-600/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details & Pricing */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3
              onClick={() => openProductDetails()}
              className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
            >
              {product.title || "Untitled Garment"}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description ||
              "Architectural silhouette with tailored drape."}
          </p>
        </div>

        {/* Price & Bottom CTA */}
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block uppercase">
              Atelier Spec
            </span>
            <span className="text-base font-bold font-mono text-amber-400">
              {formatINR(product.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={onAddToBag}
            title="Quick Add to Bag"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/20 hover:border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-zinc-950 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>+ Bag</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default Home;
